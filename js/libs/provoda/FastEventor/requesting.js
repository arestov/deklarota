define(function (require) {
'use strict';
var Promise = require('Promise');
var hp = require('../helpers');
var spv = require('spv');
var batching = require('./batching')

var req_utils = require('./req-utils')
var getRequestByDeclr = req_utils.getRequestByDeclr
var findErrorByList = req_utils.findErrorByList
var onPromiseFail = req_utils.onPromiseFail

var releaseBatch = batching.releaseBatch
var batch = batching.batch

var clean_obj = {};

function nestingMark(nesting_name, name) {
  return '$meta$nests$' + nesting_name + '$' + name;
}

var withoutSelf = function(array, name) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] != name) {
      return spv.arrayExclude(array, name)
    }
  }

  return array;
}


return {
  requestState: (function(){

    function failed(err) {
      return Promise.reject(err);
    }

    function bindRequest(request, selected_map, store, self) {
      var network_api = hp.getNetApiByDeclr(selected_map.send_declr, self.sputnik);


      var states_list = selected_map.states_list;
      var parse = selected_map.parse;

      function anyway() {
        store.process = false;
        self.sputnik.updateManyStates(makeLoadingMarks('loading', states_list, false));
      }

      function markAttemptComplete() {
        var states = {}

        makeLoadingMarks('load_attempting', selected_map.states_list, false, states)
        makeLoadingMarks('load_attempted', selected_map.states_list, true, states)
        makeLoadingMarks('load_attempted_at', selected_map.states_list, Date.now(), states)

        self.sputnik.updateManyStates(states);
      }

      onPromiseFail(request, function(){
        store.error = true;
      });



      return request.then(function(r) {
        return new Promise(function(resolve) {
          self.sputnik.nextTick(function() {
            var has_error = network_api.errors_fields ? findErrorByList(r, network_api.errors_fields) : network_api.checkResponse(r);
            if (!has_error) {
              var morph_helpers = self.sputnik.morph_helpers;
              var result = parse.call(self.sputnik, r, null, morph_helpers);
              if (result) {
                return resolve(result)
              }
            }

            resolve(failed(new Error(has_error || 'no Result')));
          })
        })
      }).then(self.sputnik.inputFn(function (response) {
        anyway();
        handleStatesResponse(response);
        markAttemptComplete()
      }), function(err) {
        self.sputnik.input(anyway);
        self.sputnik.input(markAttemptComplete);
        throw err
      });


      function handleStatesResponse(result){
        // should be in data bus queue - use `.input` wrap
        var i;
        var result_states;

        if (Array.isArray(result)) {
          if (result.length != states_list.length) {
            throw new Error('values array does not match states array');
          }

          result_states = {};
          for (i = 0; i < states_list.length; i++) {
            result_states[ states_list[i] ] = result[ i ];
          }

        } else if (typeof result == 'object') {
          for (i = 0; i < states_list.length; i++) {
            if (!result.hasOwnProperty(states_list[i])) {
              throw new Error('object must have all props:' + states_list + ', but does not have ' + states_list[i]);
            }
          }
          result_states = result;
        }

        for (var i = 0; i < states_list.length; i++) {
          result_states[states_list[i] + '__$complete'] = true;
          result_states['$meta$states$' + states_list[i] + '$complete'] = true;

        }

        self.sputnik.updateManyStates( result_states );


        store.error = false;
        store.done = true;
      }
    }

    function sendRequest(selected_map, store, self) {
      var request = getRequestByDeclr(selected_map.send_declr, self.sputnik,
        {has_error: store.error},
        {nocache: store.error});

      self.addRequest(request);
      return request;

    }

    function checkDependencies(selected_map, store, self) {
      var not_ok;
      for (var i = 0; i < selected_map.dependencies.length; i++) {
        if (!self.sputnik.state(selected_map.dependencies[i])) {
          not_ok = selected_map.dependencies[i];
          break;
        }
      }

      if (not_ok) {
        return failed(new Error('missing ' + not_ok));
      }

      return sendRequest(selected_map, store, self);
    }

    function compxUsed(self, cur) {
      var compx = self.sputnik.compx_check[cur];
      if (!compx) {
        return null;
      }

      if (self.sputnik.state(cur) != null) {
        return self.sputnik.state(cur);
      }

      var without_self_name = withoutSelf(compx.watch_list, compx.name)
      return requestDependencies(self, without_self_name, true)
    }

    function requestDependencies(self, dependencies, soft) {
      var reqs_list = [];
      for (var i = 0; i < dependencies.length; i++) {
        var cur = dependencies[i];
        var used_compex = compxUsed(self, cur)
        if (used_compex != null) {
          reqs_list.push(used_compex)
          continue
        }

        if (soft) {
          var maps_for_state = self.sputnik._states_reqs_index && self.sputnik._states_reqs_index[cur];
          if (!maps_for_state) {
            continue;
          }
        }

        var dep_req = self.requestState(dependencies[i]);
        if (dep_req) {
          reqs_list.push(dep_req);
        }
      }

      var req = !reqs_list.length
        ? Promise.resolve()
        : Promise.all(reqs_list);

      return req;
    }

    function makeLoadingMarks(suffix, states_list, value, result) {
      var loading_marks = result || {};
      for (var i = 0; i < states_list.length; i++) {
        loading_marks[states_list[i] + '__' +  suffix] = value; // legacy
        loading_marks['$meta$states$' + states_list[i] + '$' +  suffix] = value;

      }
      return loading_marks;
    }

    return function(state_name) {
      var current_value = this.sputnik.state(state_name);
      if (current_value != null) {
        return;
      }

      var used_compex = compxUsed(this, state_name)
      if (used_compex != null) {
        return used_compex
      }

      var i, cur;
      var maps_for_state = this.sputnik._states_reqs_index && this.sputnik._states_reqs_index[state_name];
      if (!maps_for_state) {
        console.warn('cant request state:', state_name, 'but tried. should not try without dcl')
      }
      var cant_request;
      if (this.mapped_reqs) {
        for (i = 0; i < maps_for_state.length; i++) {
          cur = this.mapped_reqs[maps_for_state[i].num];
          if (cur && (cur.done || cur.process)) {
            cant_request = true;
            break;
          }
        }
      }

      if (cant_request) {
        return;
      }

      var selected_map = maps_for_state[0]; //take first
      var selected_map_num = selected_map.num;
      if (!this.mapped_reqs) {
        this.mapped_reqs = {};
      }


      if ( !this.mapped_reqs[selected_map_num] ) {
        this.mapped_reqs[selected_map_num] = {
          done: false,
          error: false,
          process: false
        };
      }

      var store = this.mapped_reqs[selected_map_num];

      store.process = true;

      var self = this;

      this.sputnik.input(function () {
        var states = {}
        makeLoadingMarks('loading', selected_map.states_list, true, states)
        makeLoadingMarks('load_attempting', selected_map.states_list, true, states)
        self.sputnik.updateManyStates(states);
      })


      if (!selected_map.dependencies) {
        return bindRequest(sendRequest(selected_map, store, this), selected_map, store, this);
      }


      var req = requestDependencies(self, selected_map.dependencies).then(function () {
        return checkDependencies(selected_map, store, self);
      });

      return bindRequest(req, selected_map, store, self);

    };
  })(),
  requestNesting: function(dclt, nesting_name, limit) {
    // 'loading_nesting_' + nesting_name
    // nesting_name + '$loading'
    // 'main_list_loading', true
    // nesting_name + "$error"
    // nesting_name + '$waiting_queue'


    if (!dclt) {
      return;
    }
    if (!this.nesting_requests) {
      this.nesting_requests = {};
    }

    if (!this.nesting_requests[ nesting_name ]) {
      this.nesting_requests[ nesting_name ] = {
        //has_items: false,
        has_all_items: false,
        last_page: 0,
        error: false,
        process: false
      };
    }

    var store = this.nesting_requests[ nesting_name ];
    if (store.process || store.has_all_items) {
      return;
    }
    var _this = this;

    var is_main_list = nesting_name == this.sputnik.main_list_name;

    this.sputnik.input(function() {
      _this.sputnik.updateState(nesting_name + '$load_attempting', true); // legacy
      _this.sputnik.updateState(nestingMark(nesting_name, 'load_attempting'), true);

      _this.sputnik.updateState('loading_nesting_' + nesting_name, true); // old legacy
      _this.sputnik.updateState(nesting_name + '$loading', true); // legacy
      _this.sputnik.updateState(nestingMark(nesting_name, 'loading'), true);
      if (is_main_list) {
        _this.sputnik.updateState('main_list_loading', true); // old old legacy
      }
    })

    var parse_items = dclt.parse_items;
    var parse_serv = dclt.parse_serv;
    var side_data_parsers = dclt.side_data_parsers;
    var send_declr = dclt.send_declr;
    var supports_paging = !!parse_serv;
    var limit_value = limit && (limit[1] - limit[0]);
    var paging_opts = this.sputnik.getPagingInfo(nesting_name, limit_value);

    var network_api_opts = {
      nocache: store.error
    };

    if (supports_paging) {
      network_api_opts.paging = paging_opts;
    }




    var request = getRequestByDeclr(send_declr, this.sputnik,
      {has_error: store.error, paging: paging_opts},
      network_api_opts);
    var network_api = request.network_api;
    var source_name = network_api.source_name;

    store.process = true;

    function markAttemptComplete() {
      var states = {}
      states[nesting_name + '$load_attempting'] = false // legacy
      states[nestingMark(nesting_name, 'load_attempting')] = false

      states[nesting_name + '$load_attempted'] = true // legacy
      states[nestingMark(nesting_name, 'load_attempted')] = true

      var now = Date.now()
      states[nesting_name + '$load_attempted_at'] = now // legacy
      states[nestingMark(nesting_name, 'load_attempted_at')] = now

       _this.sputnik.updateManyStates(states);
    }

    function anyway() {
      store.process = false;

      _this.sputnik.updateState('loading_nesting_' + nesting_name, false); // old legacy
      _this.sputnik.updateState(nesting_name + '$loading', false); // legacy
      _this.sputnik.updateState(nestingMark(nesting_name, 'loading'), false);

      if (is_main_list) {
        _this.sputnik.updateState('main_list_loading', false); // old old legacy
      }
    }

    function handleError() {
      //
      _this.sputnik.updateState(nesting_name + "$error", true); // legacy
      _this.sputnik.updateState(nestingMark(nesting_name, 'error'), true);

      anyway();
      markAttemptComplete()

    }

    onPromiseFail(request, function(){
      store.error = true;
    });

    var initiator = _this.sputnik.current_motivator;
    var release;
    if (initiator) {
      var num = initiator.num;
      batch(_this.sputnik, num);

      release = function () {
        releaseBatch(this, num);
      };
      release.init_end = true;
    }

    /*
      postfixes:

      $error
      $has_any
      $all_loaded
      $loading
      $waiting_queue

    */

    if (request.queued_promise) {
      var startWaiting = function () {
        _this.sputnik.updateState(nesting_name + '$waiting_queue', true); // legacy
        _this.sputnik.updateState(nestingMark(nesting_name, 'waiting_queue'), true);
      };
      this.sputnik.input(startWaiting)

      var stopWaiting = function () {
        _this.sputnik.updateState(nesting_name + '$waiting_queue', false); // legacy
        _this.sputnik.updateState(nestingMark(nesting_name, 'waiting_queue'), false);
      };

      request.queued_promise.then(stopWaiting, stopWaiting);
    }



    request.then(function (response) {
      if (release) {
        _this.sputnik.nextTick(release, null, false, initiator);
      }
      _this.sputnik.input(function () {
        handleNestResponse(response);
        anyway();
        markAttemptComplete()
      });

    }, function () {
      if (release) {
        _this.sputnik.nextTick(release, null, false, initiator);
      }
      _this.sputnik.input(handleError);


    });

    function handleNestResponse(r){
      // should be in data bus queue - use `.input` wrap
      var sputnik = _this.sputnik;
      var has_error = network_api.errors_fields ? findErrorByList(r, network_api.errors_fields) : network_api.checkResponse(r);

      if (has_error){
        store.error = true;
        sputnik.updateState(nesting_name + "$error", true); // legacy
        sputnik.updateState(nestingMark(nesting_name, 'error'), true);
        return;
      }



      var many_states = {};
      many_states[nesting_name + "$error"] = null;
      many_states[nestingMark(nesting_name, "error")] = null;

      many_states[nesting_name + "$has_any"] = true;
      many_states[nestingMark(nesting_name, "has_any")] = true;

      var morph_helpers = sputnik.app.morph_helpers;
      var items = parse_items.call(sputnik, r, clean_obj, morph_helpers, network_api);
      var serv_data = typeof parse_serv == 'function' && parse_serv.call(sputnik, r, paging_opts, morph_helpers);

      if (!supports_paging) {
        store.has_all_items = true;
        if (is_main_list) {
          many_states['all_data_loaded'] = true // old old legacy
        }

        many_states[nesting_name + "$all_loaded"] = true;
        many_states[nestingMark(nesting_name, "all_loaded")] = true;

      } else {
        var has_more_data = hasMoreData(serv_data, limit_value, paging_opts, items);

        if (!has_more_data) {
          store.has_all_items = true;

          if (is_main_list) {
            many_states['all_data_loaded'] = true // old old legacy
          }

          many_states[nesting_name + "$all_loaded"] = true; // legacy
          many_states[nestingMark(nesting_name, "all_loaded")] = true;
        }
      }

      sputnik.updateManyStates(many_states);

      items = paging_opts.remainder ? items.slice( paging_opts.remainder ) : items;

      sputnik.insertDataAsSubitems(sputnik, nesting_name, items, serv_data, source_name);

      if (!sputnik.loaded_nestings_items) {
        sputnik.loaded_nestings_items = {};
      }

      if (!sputnik.loaded_nestings_items[nesting_name]) {
        sputnik.loaded_nestings_items[nesting_name] = 0;
      }
      var has_data_holes = serv_data === true || (serv_data && serv_data.has_data_holes === true);

      sputnik.loaded_nestings_items[nesting_name] +=
        has_data_holes ? paging_opts.page_limit : (items ? items.length : 0);
      //special logic where server send us page without few items. but it can be more pages available
      //so serv_data in this case is answer for question "Is more data available?"

      if (!side_data_parsers) {return;}

      for (var i = 0; i < side_data_parsers.length; i++) {
        sputnik.nextTick(
          sputnik.handleNetworkSideData, [
            sputnik,
            source_name,
            side_data_parsers[i][0],
            side_data_parsers[i][1].call(sputnik, r, paging_opts, morph_helpers)
          ], true);
      }

      //сделать выводы о завершенности всех данных
    }

    this.addRequest(request);
    return request;

    /*
    есть ли декларация
    все ли возможные данные получены
    в процессе запроса (пока можно запрашивать в один поток)


    маркировка ошибок с прошлых запросов не участвует в принятиях решений, но используется для отказа от кеша при новых запросах


    */
  }


};

function hasMoreData(serv_data, page_limit, paging_opts, items) {
  if (serv_data === true) {
    return true;
  } else if (serv_data && ((serv_data.hasOwnProperty('total_pages_num') && serv_data.hasOwnProperty('page_num')) || serv_data.hasOwnProperty('total'))) {
    if (!isNaN(serv_data.total)) {
      if ( (paging_opts.current_length + items.length) < serv_data.total && serv_data.total > paging_opts.page_limit) {
        return true;
      }
    } else {
      if (serv_data.page_num < serv_data.total_pages_num) {
        return true;
      }
    }

  } else {
    return items.length == page_limit;
  }

}


});
