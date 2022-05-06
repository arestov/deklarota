
import Promise from '../../../common-libs/Promise-3.1.0.mod'
import getNetApiByDeclr from '../helpers/getNetApiByDeclr'
import spv from '../../spv'
import req_utils from './req-utils'
import types from './stateReqTypes'
import { addRequestToRequestsManager } from '../dcl/effects/legacy/api/requests_manager'

const arrayExclude = spv.arrayExclude

const getRequestByDeclr = req_utils.getRequestByDeclr
const findErrorByList = req_utils.findErrorByList
const onPromiseFail = req_utils.onPromiseFail


const withoutSelf = function(array, name) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] != name) {
      return arrayExclude(array, name)
    }
  }

  return array
}

const NO_RESULT = 'no Result'


function failed(err) {
  return Promise.reject(err)
}

function bindRequest(api, request, selected_map, store, self) {
  const network_api = getNetApiByDeclr(selected_map.send_declr, self)


  const states_list = selected_map.states_list
  const parse = selected_map.parse

  function anyway() {
    store.process = false
    self.updateManyStates(makeLoadingMarks(types.loading, states_list, false))
  }

  function markAttemptComplete() {
    const states = {}

    makeLoadingMarks(types.load_attempting, selected_map.states_list, false, states)
    makeLoadingMarks(types.load_attempted, selected_map.states_list, true, states)
    makeLoadingMarks(types.load_attempted_at, selected_map.states_list, Date.now(), states)

    self.updateManyStates(states)
  }

  onPromiseFail(request, function() {
    store.error = true
  })

  function wasReset() {
    const current_store = self.mapped_reqs && self.mapped_reqs[selected_map.num]
    return current_store != store
  }


  return request.then(function(r) {
    return new Promise(function(resolve) {
      self.input(function() {
        if (wasReset()) {
          resolve(failed('reset'))
          return
        }

        const has_error = network_api.errors_fields ? findErrorByList(r, network_api.errors_fields) : network_api.checkResponse(r)
        if (!has_error) {
          const morph_helpers = self.morph_helpers
          const result = parse.call(self, r, null, morph_helpers)
          if (result != null) {
            return resolve(result)
          }
        }

        if (has_error) {
          resolve(failed(new Error(has_error)))
          return
        }

        resolve(failed(new Error(NO_RESULT)))
      })
    })
  }).then((response) => {
    self.inputFromInterface(api, () => {
      if (wasReset()) {return}

      anyway()
      handleStatesResponse(response)
      markAttemptComplete()
    })
  }, function(err) {
    if (wasReset()) {return}

    self.inputFromInterface(api, anyway)
    self.inputFromInterface(api, markAttemptComplete)
    console.error(err, self.hierarchy_path_string, self.__code_path)
  })


  function handleStatesResponse(result) {
    // should be in data bus queue - use `.input` wrap
    let i
    let result_states = {}

    if (Array.isArray(result)) {
      if (result.length != states_list.length) {
        throw new Error('values array does not match states array')
      }
      for (i = 0; i < states_list.length; i++) {
        result_states[ states_list[i] ] = result[ i ]
      }

    } else if (typeof result == 'object') {
      for (i = 0; i < states_list.length; i++) {
        if (!result.hasOwnProperty(states_list[i])) {
          throw new Error('object must have all props:' + states_list + ', but does not have ' + states_list[i])
        }
      }
      result_states = result
    }

    for (i = 0; i < states_list.length; i++) {
      result_states['$meta$attrs$' + states_list[i] + '$complete'] = true

    }

    self.updateManyStates(result_states)


    store.error = false
    store.done = true
  }
}

function sendRequest(selected_map, store, self) {
  const request = getRequestByDeclr(selected_map.send_declr, self,
    {has_error: store.error},
    {nocache: store.error})

  addRequestToRequestsManager(self, request, 'input', selected_map, getNetApiByDeclr(selected_map.send_declr, self))

  return request

}

function someValue(value) {
  return value != null
}

function checkDependencies(selected_map, store, self) {
  let not_ok
  for (let i = 0; i < selected_map.dependencies.length; i++) {
    if (!someValue(self.state(selected_map.dependencies[i]))) {
      not_ok = selected_map.dependencies[i]
      break
    }
  }

  if (not_ok) {
    return failed(new Error('missing ' + not_ok))
  }

  return sendRequest(selected_map, store, self)
}

function compxUsed(self, cur) {
  const compx = self.compx_check[cur]
  if (!compx) {
    return null
  }

  if (someValue(self.state(cur))) {
    return self.state(cur)
  }

  const without_self_name = withoutSelf(compx.watch_list, compx.name)
  return requestDependencies(self, without_self_name, true)
}

function requestDependencies(self, dependencies, soft) {
  const reqs_list = []
  for (let i = 0; i < dependencies.length; i++) {
    const cur = dependencies[i]
    const used_compex = compxUsed(self, cur)
    if (someValue(used_compex)) {
      reqs_list.push(used_compex)
      continue
    }

    if (soft) {
      const maps_for_state = self._states_reqs_index && self._states_reqs_index[cur]
      if (!maps_for_state) {
        continue
      }
    }

    const dep_req = self.requestState(dependencies[i])
    if (dep_req) {
      reqs_list.push(dep_req)
    }
  }

  const req = !reqs_list.length
    ? Promise.resolve()
    : Promise.all(reqs_list)

  return req
}

function makeLoadingMarks(suffix, states_list, value, result) {
  const loading_marks = result || {}
  for (let i = 0; i < states_list.length; i++) {
    loading_marks['$meta$attrs$' + states_list[i] + '$' + suffix] = value

  }
  return loading_marks
}

export function resetRequestedState(state_name) {
  const maps_for_state = this._states_reqs_index && this._states_reqs_index[state_name]
  if (!maps_for_state) {
    console.warn('cant reset requested state:', state_name, 'but tried. should not try without dcl')
  }
  const selected_map = maps_for_state[0] //take first
  const selected_map_num = selected_map.num
  const store = this.mapped_reqs && this.mapped_reqs[selected_map_num]
  if (!store) {
    return
  }

  this.mapped_reqs[selected_map_num] = null
  const self = this
  this.input(function() {
    const states = {}
    const list = [state_name]


    makeLoadingMarks(types.loading, list, null, states)
    makeLoadingMarks(types.load_attempting, list, null, states)
    makeLoadingMarks(types.load_attempted, list, null, states)
    makeLoadingMarks(types.load_attempted_at, list, null, states)
    makeLoadingMarks(types.complete, list, null, states)
    states[state_name] = null

    self.updateManyStates(states)
  })

}

const requestState = function(state_name) {
  const current_value = this.state(state_name)
  if (someValue(current_value)) {
    return
  }

  const used_compex = compxUsed(this, state_name)
  if (someValue(used_compex)) {
    return used_compex
  }

  let i
  let cur
  const maps_for_state = this._states_reqs_index && this._states_reqs_index[state_name]
  if (!maps_for_state) {
    console.warn('cant request state:', state_name, 'but tried. should not try without dcl')
  }
  let cant_request
  if (this.mapped_reqs) {
    for (i = 0; i < maps_for_state.length; i++) {
      cur = this.mapped_reqs[maps_for_state[i].num]
      if (cur && (cur.done || cur.process)) {
        cant_request = true
        break
      }
    }
  }

  if (cant_request) {
    return
  }

  const selected_map = maps_for_state[0] //take first

  const api = getNetApiByDeclr(selected_map.send_declr, this)
  if (!api) {
    console.warn(new Error('api not ready yet'), selected_map.send_declr)
    return
  }

  const selected_map_num = selected_map.num
  if (!this.mapped_reqs) {
    this.mapped_reqs = {}
  }


  if (!this.mapped_reqs[selected_map_num]) {
    this.mapped_reqs[selected_map_num] = {
      done: false,
      error: false,
      process: false
    }
  }

  const store = this.mapped_reqs[selected_map_num]

  store.process = true

  const self = this

  this.inputFromInterface(api, function() {
    if (self.mapped_reqs[selected_map.num] != store) {
      return
    }
    const states = {}
    makeLoadingMarks(types.loading, selected_map.states_list, true, states)
    makeLoadingMarks(types.load_attempting, selected_map.states_list, true, states)
    self.updateManyStates(states)
  })


  if (!selected_map.dependencies) {
    return bindRequest(api, sendRequest(selected_map, store, this), selected_map, store, this)
  }


  const req = requestDependencies(self, selected_map.dependencies).then(function() {
    return checkDependencies(selected_map, store, self)
  })

  return bindRequest(api, req, selected_map, store, self)

}

export const initAttrsRequesting = (self) => {
  self.mapped_reqs = null
}


export default requestState
