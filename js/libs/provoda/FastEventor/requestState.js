define(function(require) {
'use strict'
var Promise = require('Promise');
var getNetApiByDeclr = require('../helpers/getNetApiByDeclr');
var spv = require('spv');
var req_utils = require('./req-utils')
var types = require('./stateReqTypes')

var arrayExclude = spv.arrayExclude

var getRequestByDeclr = req_utils.getRequestByDeclr
var findErrorByList = req_utils.findErrorByList
var onPromiseFail = req_utils.onPromiseFail
var getRequestByDeclr = req_utils.getRequestByDeclr


var withoutSelf = function(array, name) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] != name) {
      return arrayExclude(array, name)
    }
  }

  return array;
}


function failed(err) {
  return Promise.reject(err);
}

function bindRequest(request, selected_map, store, self) {
  var network_api = getNetApiByDeclr(selected_map.send_declr, self.sputnik);


  var states_list = selected_map.states_list;
  var parse = selected_map.parse;

  function anyway() {
    store.process = false;
    self.sputnik.updateManyStates(makeLoadingMarks(types.loading, states_list, false));
  }

  function markAttemptComplete() {
    var states = {}

    makeLoadingMarks(types.load_attempting, selected_map.states_list, false, states)
    makeLoadingMarks(types.load_attempted, selected_map.states_list, true, states)
    makeLoadingMarks(types.load_attempted_at, selected_map.states_list, Date.now(), states)

    self.sputnik.updateManyStates(states);
  }

  onPromiseFail(request, function(){
    store.error = true;
  });

  function wasReset() {
    var current_store = self.mapped_reqs && self.mapped_reqs[selected_map.num]
    return current_store != store
  }


  return request.then(function(r) {
    return new Promise(function(resolve) {
      self.sputnik.nextTick(function() {
        if (wasReset()) {
          resolve(failed('reset'));
          return
        }

        var has_error = network_api.errors_fields ? findErrorByList(r, network_api.errors_fields) : network_api.checkResponse(r);
        if (!has_error) {
          var morph_helpers = self.sputnik.morph_helpers;
          var result = parse.call(self.sputnik, r, null, morph_helpers);
          if (result != null) {
            return resolve(result)
          }
        }

        resolve(failed(new Error(has_error || 'no Result')));
      })
    })
  }).then(self.sputnik.inputFn(function (response) {
    if (wasReset()) {return}

    anyway();
    handleStatesResponse(response);
    markAttemptComplete()
  }), function(err) {
    if (wasReset()) {return}

    self.sputnik.input(anyway);
    self.sputnik.input(markAttemptComplete);
    console.log(err)
  });


  function handleStatesResponse(result){
    // should be in data bus queue - use `.input` wrap
    var i;
    var result_states = {};

    if (Array.isArray(result)) {
      if (result.length != states_list.length) {
        throw new Error('values array does not match states array');
      }
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

function someValue(value) {
  return value != null
}

function checkDependencies(selected_map, store, self) {
  var not_ok;
  for (var i = 0; i < selected_map.dependencies.length; i++) {
    if (!someValue(self.sputnik.state(selected_map.dependencies[i]))) {
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

  if (someValue(self.sputnik.state(cur))) {
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
    if (someValue(used_compex)) {
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

function resetRequestedState(state_name) {
  var maps_for_state = this.sputnik._states_reqs_index && this.sputnik._states_reqs_index[state_name];
  if (!maps_for_state) {
    console.warn('cant reset requested state:', state_name, 'but tried. should not try without dcl')
  }
  var selected_map = maps_for_state[0]; //take first
  var selected_map_num = selected_map.num;
  var store = this.mapped_reqs && this.mapped_reqs[selected_map_num];
  if (!store) {
    return
  }

  this.mapped_reqs[selected_map_num] = null
  var self = this
  this.sputnik.input(function() {
    var states = {}
    var list = [state_name]


    makeLoadingMarks(types.loading, list, null, states)
    makeLoadingMarks(types.load_attempting, list, null, states)
    makeLoadingMarks(types.load_attempted, list, null, states)
    makeLoadingMarks(types.load_attempted_at, list, null, states)
    makeLoadingMarks(types.complete, list, null, states)
    states[state_name] = null

    self.sputnik.updateManyStates(states);
  })

}

var requestState = function(state_name) {
  var current_value = this.sputnik.state(state_name);
  if (someValue(current_value)) {
    return;
  }

  var used_compex = compxUsed(this, state_name)
  if (someValue(used_compex)) {
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

  if (!getNetApiByDeclr(selected_map.send_declr, this.sputnik)) {
    console.warn(new Error('api not ready yet'), selected_map.send_declr)
    return
  }

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
    if (self.mapped_reqs[selected_map.num] != store) {
      return
    }
    var states = {}
    makeLoadingMarks(types.loading, selected_map.states_list, true, states)
    makeLoadingMarks(types.load_attempting, selected_map.states_list, true, states)
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

requestState.resetRequestedState = resetRequestedState

return requestState

})
