define(function(require) {
'use strict'
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

function statesAnyway(states, nesting_name, is_main_list) {
  states['loading_nesting_' + nesting_name] = false // old legacy
  states[nesting_name + '$loading'] = false; // legacy
  if (is_main_list) {
    states['main_list_loading'] = false // old old legacy
  }

  states[nestingMark(nesting_name, 'loading')] = false

  return states
}

function statesComplete(states, nesting_name) {
  states[nesting_name + '$load_attempting'] = false // legacy
  states[nestingMark(nesting_name, 'load_attempting')] = false

  states[nesting_name + '$load_attempted'] = true // legacy
  states[nestingMark(nesting_name, 'load_attempted')] = true

  var now = Date.now()
  states[nesting_name + '$load_attempted_at'] = now // legacy
  states[nestingMark(nesting_name, 'load_attempted_at')] = now
  return states
}



function statesData(states, nesting_name, can_load_more, is_main_list) {
  states[nesting_name + "$error"] = null;
  states[nestingMark(nesting_name, "error")] = null;

  states[nesting_name + "$has_any"] = true;
  states[nestingMark(nesting_name, "has_any")] = true;

  if (can_load_more) {
    return
  }

  if (is_main_list) {
    states['all_data_loaded'] = true // old old legacy
  }

  states[nesting_name + "$all_loaded"] = true;
  states[nestingMark(nesting_name, "all_loaded")] = true;
}


function statesStart(states, nesting_name, is_main_list) {
  states[nesting_name + '$load_attempting'] = true // legacy
  states[nestingMark(nesting_name, 'load_attempting')] = true;

  states['loading_nesting_' + nesting_name] = true; // old legacy
  states[nesting_name + '$loading'] = true; // legacy
  states[nestingMark(nesting_name, 'loading')] = true
  if (is_main_list) {
    states['main_list_loading'] = true // old old legacy
  }
  return states
}

function statesError(states, nesting_name) {
  states[nesting_name + "$error"] = true // legacy
  states[nestingMark(nesting_name, 'error')] = true
}

function statesQueue(states, nesting_name, mark) {
  states[nesting_name + '$waiting_queue'] = mark // legacy
  states[nestingMark(nesting_name, 'waiting_queue')] = mark
}

return function(dclt, nesting_name, limit) {
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
    var states = {}
    statesStart(states, nesting_name, is_main_list)
    _this.sputnik.updateManyStates(states)
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
    statesComplete(states, nesting_name)
     _this.sputnik.updateManyStates(states);
  }

  function anyway() {
    store.process = false;

    var states = {}
    statesAnyway(states, nesting_name, is_main_list)
    _this.sputnik.updateManyStates(states);
  }

  function handleError() {

    var states = {}
    statesError(states, nesting_name)
    _this.sputnik.updateManyStates(states)

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
      _this.sputnik.updateManyStates(statesQueue({}, nesting_name, true))
    };
    this.sputnik.input(startWaiting)

    var stopWaiting = function () {
      _this.sputnik.updateManyStates(statesQueue({}, nesting_name, false))
    };

    request.queued_promise.then(stopWaiting, stopWaiting);
  }



  request.then(function (response) {
    if (release) {
      _this.sputnik.nextTick(release, null, false, initiator);
    }
    _this.sputnik.input(function () {
      var has_error = detectError(response)
      if (!has_error){
        store.has_all_items = true
        handleNestResponse(response, function() {
          store.has_all_items = false
        });
        anyway();
        markAttemptComplete()
        return
      } else {
        store.error = true;
        var states = {}
        statesError(states, nesting_name)
        _this.sputnik.updateManyStates(states)
        anyway();
        markAttemptComplete()
      }


    });

  }, function () {
    if (release) {
      _this.sputnik.nextTick(release, null, false, initiator);
    }
    _this.sputnik.input(handleError);


  });

  function detectError(resp) {
    var has_error = network_api.errors_fields
      ? findErrorByList(resp, network_api.errors_fields)
      : network_api.checkResponse(resp);

    return has_error
  }

  function handleNestResponse(r, markListIncomplete){
    // should be in data bus queue - use `.input` wrap
    var sputnik = _this.sputnik;

    var morph_helpers = sputnik.app.morph_helpers;
    var items = parse_items.call(sputnik, r, clean_obj, morph_helpers, network_api);
    var serv_data = typeof parse_serv == 'function' && parse_serv.call(sputnik, r, paging_opts, morph_helpers);
    var can_load_more = supports_paging && hasMoreData(serv_data, limit_value, paging_opts, items)

    if (can_load_more) {
      markListIncomplete()
    }

    var many_states = {};
    statesData(many_states, nesting_name, can_load_more, is_main_list)
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

})
