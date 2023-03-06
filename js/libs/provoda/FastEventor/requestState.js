
import Promise from '../../../common-libs/Promise-3.1.0.mod'
import getNetApiByDeclr from '../helpers/getNetApiByDeclr'
import spv from '../../spv'
import req_utils from './req-utils'
import types from './stateReqTypes'
import { addRequestToRequestsManager } from '../dcl/effects/legacy/api/requests_manager'
import { hasOwnProperty } from '../hasOwnProperty'
import _getAttrReqState from '../dcl/effects/legacy/state_req/_getAttrReqState'
import _setAttrReqState from '../dcl/effects/legacy/state_req/_setAttrReqState'

const arrayExclude = spv.arrayExclude

const getRequestByDeclr = req_utils.getRequestByDeclr
const findErrorByList = req_utils.findErrorByList
const onPromiseFail = req_utils.onPromiseFail

const getReqState = (self, key) => _getAttrReqState(self, key)

const reqAttrName = (req_dcl) => {
  return `$meta$input_attrs_requests$${req_dcl.name}$done`
}

const setReqState = (self, key, prop, value) => {
  const store = _getAttrReqState(self, key) || {
    error: false,
    process: false
  }

  // it's ok to mutate store
  store[prop] = value
  _setAttrReqState(self, key, store)

  return store
}

const deleteReqState = (self, key) => _setAttrReqState(self, key, null)


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
    self.updateManyStates(makeLoadingMarks(self, types.loading, states_list, false))
  }

  function markAttemptComplete() {
    const states = {}

    makeLoadingMarks(self, types.load_attempting, selected_map.states_list, false, states)
    makeLoadingMarks(self, types.load_attempted, selected_map.states_list, true, states)
    makeLoadingMarks(self, types.load_attempted_at, selected_map.states_list, Date.now(), states)

    self.updateManyStates(states)
  }

  onPromiseFail(request, function() {
    store.error = true
  })

  function wasReset() {
    const current_store = getReqState(self, selected_map.num)
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
          const morph_helpers = self.app.getInterface('$morph_helpers')
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
      result_states['$meta$attrs$' + states_list[i] + '$' + types.complete] = true

    }

    result_states[reqAttrName(selected_map)] = true

    self.updateManyStates(result_states)


    store.error = false
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

function compxUsed(self, cur) {
  const compx = self.compx_check[cur]
  if (!compx) {
    return null
  }

  if (someValue(self.getAttr(cur))) {
    return self.getAttr(cur)
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

function makeLoadingMarks(self, suffix, states_list, value, result) {
  const loading_marks = result || {}
  for (let i = 0; i < states_list.length; i++) {
    const attr_name = '$meta$attrs$' + states_list[i] + '$' + suffix
    if (!hasOwnProperty(self.__default_attrs, attr_name)) {
      continue
    }

    loading_marks[attr_name] = value

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
  const store = getReqState(selected_map_num)
  if (store) {
    deleteReqState(this, selected_map_num)
  }

  const self = this
  this.input(function() {
    const states = {}
    states[reqAttrName(selected_map)] = false
    const list = [state_name]


    makeLoadingMarks(self, types.loading, list, null, states)
    makeLoadingMarks(self, types.load_attempting, list, null, states)
    makeLoadingMarks(self, types.load_attempted, list, null, states)
    makeLoadingMarks(self, types.load_attempted_at, list, null, states)
    makeLoadingMarks(self, types.complete, list, null, states)
    states[state_name] = null

    self.updateManyStates(states)
  })

}

const requestState = function(state_name) {
  const current_value = this.getAttr(state_name)
  if (someValue(current_value)) {
    return
  }

  const used_compex = compxUsed(this, state_name)
  if (someValue(used_compex)) {
    return used_compex
  }


  const maps_for_state = this._states_reqs_index && this._states_reqs_index[state_name]
  if (!maps_for_state) {
    console.warn('cant request state:', state_name, 'but tried. should not try without dcl')
  }
  let cant_request
  for (let i = 0; i < maps_for_state.length; i++) {
    if (this.getAttr(reqAttrName(maps_for_state[i]))) {
      cant_request = true
      break
    }
    const cur = getReqState(this, maps_for_state[i].num)
    if (cur && cur.process) {
      cant_request = true
      break
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

  const store = setReqState(this, selected_map_num, 'process', true)

  const self = this

  this.inputFromInterface(api, function() {
    if (getReqState(self, selected_map.num) != store) {
      return
    }
    const states = {}
    makeLoadingMarks(self, types.loading, selected_map.states_list, true, states)
    makeLoadingMarks(self, types.load_attempting, selected_map.states_list, true, states)
    self.updateManyStates(states)
  })


  if (!selected_map.dependencies) {
    return bindRequest(api, sendRequest(selected_map, store, this), selected_map, store, this)
  }


  const req = requestDependencies(self, selected_map.dependencies, true).then(function() {
    return sendRequest(selected_map, store, self)
  })

  return bindRequest(api, req, selected_map, store, self)

}


export default requestState
