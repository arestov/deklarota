import req_utils from './req-utils'
import types from '../dcl/effects/legacy/nest_req/nestReqTypes'
import getNetApiByDeclr from '../helpers/getNetApiByDeclr'
import { addRequestToRequestsManager } from '../dcl/effects/legacy/api/requests_manager'
import { FlowStepHandlRelSideDataLegacy, FlowStepUpdateManyAttrs } from '../Model/flowStepHandlers.types'
import { hasOwnProperty } from '../hasOwnProperty'
import { nestingMark } from '../dcl/effects/legacy/nest_req/nestingMark'

const getRequestByDeclr = req_utils.getRequestByDeclr
const findErrorByList = req_utils.findErrorByList


const clean_obj = {}

function exlcudeUnexpectedMetaAttrs(self, attrs) {
  for (const attr_name in attrs) {
    if (!Object.hasOwnProperty.call(attrs, attr_name)) {
      continue
    }
    if (!hasOwnProperty(self.__default_attrs, attr_name)) {
      delete attrs[attr_name]
    }
  }

  return attrs
}

function statesAnyway(self, states, nesting_name) {

  states[nestingMark(nesting_name, types.loading)] = false

  exlcudeUnexpectedMetaAttrs(self, states)
  return states
}

function statesComplete(self, states, nesting_name) {
  states[nestingMark(nesting_name, types.load_attempting)] = false

  states[nestingMark(nesting_name, types.load_attempted)] = true

  const now = Date.now()
  states[nestingMark(nesting_name, types.load_attempted_at)] = now
  exlcudeUnexpectedMetaAttrs(self, states)
  return states
}



function statesData(self, states, nesting_name) {
  states[nestingMark(nesting_name, types.error)] = null

  states[nestingMark(nesting_name, types.has_any)] = true
  exlcudeUnexpectedMetaAttrs(self, states)

}


function statesStart(self, states, nesting_name) {
  states[nestingMark(nesting_name, types.load_attempting)] = true

  states[nestingMark(nesting_name, types.loading)] = true
  exlcudeUnexpectedMetaAttrs(self, states)

  return states
}

function statesError(self, states, nesting_name) {
  states[nestingMark(nesting_name, types.error)] = true
  exlcudeUnexpectedMetaAttrs(self, states)

}

function statesQueue(self, states, nesting_name, mark) {
  states[nestingMark(nesting_name, types.waiting_queue)] = mark
  exlcudeUnexpectedMetaAttrs(self, states)

}

function startFetching(self, nesting_name, _, has_error, network_api_opts) {
  const dclt = self._nest_reqs[nesting_name]
  const send_declr = dclt.send_declr

  if (!getNetApiByDeclr(send_declr, self)) {
    console.warn(new Error('api not ready yet'), send_declr)
    return
  }

  const request = getRequestByDeclr(send_declr, self,
    {has_error: has_error},
    network_api_opts)

  const network_api = request.network_api
  const source_name = request.source_name




  function detectError(resp) {
    const has_error = network_api.errors_fields
      ? findErrorByList(resp, network_api.errors_fields)
      : network_api.checkResponse(resp)

    return has_error
  }


  return request.then(function(response) {
    const has_error = detectError(response)
    if (has_error) {
      return [has_error, response, source_name]
    }

    return [false, response, source_name]
  })
}

function initRequest(self, nesting_name, paging_opts, has_error, network_api_opts) {
  // check context isolation
  return startFetching(self, nesting_name, paging_opts, has_error, network_api_opts)
}

export const initRelsRequesting = (self) => {
  self.nesting_requests = null
}

const getStore = (model, key) => model.nesting_requests[ key ]
const setStore = (model, key, value) => {
  model.nesting_requests[ key ] = value
}

export default function(dclt, nesting_name) {
  // nesting_name + '$loading'
  // nesting_name + "$error"
  // nesting_name + '$waiting_queue'


  if (!dclt) {
    return
  }

  const send_declr = dclt.send_declr
  const api = getNetApiByDeclr(send_declr, this)
  if (!api) {
    console.warn(new Error('api not ready yet'), send_declr)
    return
  }


  if (!this.nesting_requests) {
    this.nesting_requests = {}
  }

  if (!getStore(this, nesting_name)) {
    setStore(this, nesting_name, {
      //has_items: false,
      error: false,
      process: false,
      req: null,
    })
  }


  const store = getStore(this, nesting_name)
  if (store.process) {
    return
  }

  if (this.getAttr(nestingMark(nesting_name, types.all_loaded))) {
    return
  }

  const _this = this

  const isValidRequest = function(req) {
    const store = getStore(_this, nesting_name)
    return store && store.req == req
  }

  this.inputFromInterface(api, function() {
    const states = {}
    statesStart(_this, states, nesting_name)
    _this.updateManyStates(states)
  })

  const parse_items = dclt.parse_items
  const side_data_parsers = dclt.side_data_parsers

  const network_api_opts = {
    nocache: store.error
  }
  const request = initRequest(_this, nesting_name, null, store.error, network_api_opts)


  store.process = true
  store.req = request

  function markAttemptComplete() {
    const states = {}
    statesComplete(_this, states, nesting_name)
    _this.nextTick(FlowStepUpdateManyAttrs, [states], true)
  }

  function anyway() {
    store.process = false
    if (store.req == request) {
      store.req = null
    }

    const states = {}
    statesAnyway(_this, states, nesting_name)
    _this.nextTick(FlowStepUpdateManyAttrs, [states], true)
  }

  function handleError() {
    store.error = true
    const states = {}
    statesError(_this, states, nesting_name)
    _this.nextTick(FlowStepUpdateManyAttrs, [states], true)

    anyway()
    markAttemptComplete()

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
    const changeWaitingState = (value) => () => {
      if (!isValidRequest(request)) {
        return
      }
      _this.updateManyStates(statesQueue(_this, {}, nesting_name, value))
    }

    const startWaiting = changeWaitingState(true)
    this.inputFromInterface(api, startWaiting)

    const stopWaiting = changeWaitingState(false)
    request.queued_promise.then(stopWaiting, stopWaiting)
  }

  request
    .then(function(wrapped_response) {
      const [has_error, response, source_name] = wrapped_response

      if (!isValidRequest(request)) {
        return
      }

      if (has_error) {
        _this.inputFromInterface(api, handleError)
        return
      }

      _this.inputFromInterface(api, function() {
        store.error = false
        handleNestResponse(response, source_name)
        anyway()
        markAttemptComplete()
      })

    }, function() {
      if (!isValidRequest(request)) {
        return
      }

      _this.inputFromInterface(api, handleError)


    })

  function handleNestResponse(r, source_name) {
    // should be in data bus queue - use `.input` wrap
    const sputnik = _this

    const morph_helpers = sputnik.app.getInterface('$morph_helpers')

    const result_data = parse_items.call(sputnik, r, clean_obj, morph_helpers)
    const items = Array.isArray(result_data) ? result_data : result_data.list

    const user_meta_attrs = Array.isArray(result_data) ? null : result_data.attrs
    const attr_all_loaded = nestingMark(nesting_name, types.all_loaded)
    /*
      if nothing provided let's consider that all items loaded
    */
    const value_all_loaded = user_meta_attrs?.[attr_all_loaded] ?? true
    if (user_meta_attrs) {
      const expected_meta_mark = nestingMark(nesting_name, '')
      for (const attr_name in user_meta_attrs) {
        if (!Object.hasOwnProperty.call(user_meta_attrs, attr_name)) {
          continue
        }

        if (!attr_name.startsWith(expected_meta_mark)) {
          throw new Error('attr name should starts with ' + expected_meta_mark)
        }
      }
    }

    const rel_req_meta_attrs = {
      ...user_meta_attrs,
      [attr_all_loaded]: value_all_loaded
    }
    sputnik.updateManyStates(rel_req_meta_attrs)

    const many_states = {}
    statesData(sputnik, many_states, nesting_name)

    sputnik.insertDataAsSubitems(sputnik, nesting_name, items, source_name)

    sputnik.nextTick(FlowStepUpdateManyAttrs, [many_states], true)

    if (!sputnik.loaded_nestings_items) {
      sputnik.loaded_nestings_items = {}
    }

    if (!sputnik.loaded_nestings_items[nesting_name]) {
      sputnik.loaded_nestings_items[nesting_name] = 0
    }

    sputnik.loaded_nestings_items[nesting_name] += (items ? items.length : 0)
    //special logic where server send us page without few items. but it can be more pages available
    //so serv_data in this case is answer for question "Is more data available?"

    if (!side_data_parsers) {return}

    for (let i = 0; i < side_data_parsers.length; i++) {
      sputnik.nextTick(
        FlowStepHandlRelSideDataLegacy, [
          sputnik,
          source_name,
          side_data_parsers[i][0],
          side_data_parsers[i][1].call(sputnik, r, null, morph_helpers)
        ], true)
    }

    //сделать выводы о завершенности всех данных
  }

  addRequestToRequestsManager(this, request, 'input', dclt, api)

  return request

  /*
  есть ли декларация
  все ли возможные данные получены
  в процессе запроса (пока можно запрашивать в один поток)


  маркировка ошибок с прошлых запросов не участвует в принятиях решений, но используется для отказа от кеша при новых запросах


  */
}
