import req_utils from './req-utils'
import types from './nestReqTypes'
import getNetApiByDeclr from '../helpers/getNetApiByDeclr'
import { addRequestToRequestsManager } from '../dcl/effects/legacy/api/requests_manager'
import { FlowStepHandlRelSideDataLegacy, FlowStepUpdateManyAttrs } from '../Model/flowStepHandlers.types'

const getRequestByDeclr = req_utils.getRequestByDeclr
const findErrorByList = req_utils.findErrorByList


const clean_obj = {}


function nestingMark(nesting_name, name) {
  return '$meta$rels$' + nesting_name + '$' + name
}

function statesAnyway(states, nesting_name, is_main_list) {
  if (is_main_list) {
    states[types.main_list_loading] = false // old old legacy ?
  }

  states[nestingMark(nesting_name, types.loading)] = false

  return states
}

function statesComplete(states, nesting_name) {
  states[nestingMark(nesting_name, types.load_attempting)] = false

  states[nestingMark(nesting_name, types.load_attempted)] = true

  const now = Date.now()
  states[nestingMark(nesting_name, types.load_attempted_at)] = now
  return states
}



function statesData(states, nesting_name, can_load_more, is_main_list) {
  states[nestingMark(nesting_name, types.error)] = null

  states[nestingMark(nesting_name, types.has_any)] = true

  if (can_load_more) {
    return
  }

  if (is_main_list) {
    states[types.all_data_loaded] = true // old old legacy
  }
}


function statesStart(states, nesting_name, is_main_list) {
  states[nestingMark(nesting_name, types.load_attempting)] = true

  states[nestingMark(nesting_name, types.loading)] = true
  if (is_main_list) {
    states[types.main_list_loading] = true // old old legacy
  }
  return states
}

function statesError(states, nesting_name) {
  states[nestingMark(nesting_name, types.error)] = true
}

function statesQueue(states, nesting_name, mark) {
  states[nestingMark(nesting_name, types.waiting_queue)] = mark
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

export default function(dclt, nesting_name) {
  // 'loading_nesting_' + nesting_name
  // nesting_name + '$loading'
  // 'main_list_loading', true
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

  if (!this.nesting_requests[ nesting_name ]) {
    this.nesting_requests[ nesting_name ] = {
      //has_items: false,
      error: false,
      process: false,
      req: null,
    }
  }

  const store = this.nesting_requests[ nesting_name ]
  if (store.process) {
    return
  }

  if (this.getAttr(nestingMark(nesting_name, types.all_loaded))) {
    return
  }

  const _this = this

  const isValidRequest = function(req) {
    const store = _this.nesting_requests[nesting_name]
    return store && store.req == req
  }

  const is_main_list = nesting_name == this.main_list_name

  this.inputFromInterface(api, function() {
    const states = {}
    statesStart(states, nesting_name, is_main_list)
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
    statesComplete(states, nesting_name)
    _this.nextTick(FlowStepUpdateManyAttrs, [states], true)
  }

  function anyway() {
    store.process = false
    if (store.req == request) {
      store.req = null
    }

    const states = {}
    statesAnyway(states, nesting_name, is_main_list)
    _this.nextTick(FlowStepUpdateManyAttrs, [states], true)
  }

  function handleError() {
    store.error = true
    const states = {}
    statesError(states, nesting_name)
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
      _this.updateManyStates(statesQueue({}, nesting_name, value))
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

    const morph_helpers = sputnik.app.morph_helpers
    const result_data = parse_items.call(sputnik, r, clean_obj, morph_helpers)
    const items = Array.isArray(result_data) ? result_data : result_data.list

    const user_meta_attrs = Array.isArray(result_data) ? null : result_data.attrs
    const attr_all_loaded = nestingMark(nesting_name, types.all_loaded)
    /*
      if nothing provided let's consider that all items loaded
    */
    const value_all_loaded = user_meta_attrs?.[attr_all_loaded] ?? true

    const rel_req_meta_attrs = {
      [attr_all_loaded]: value_all_loaded
    }
    sputnik.updateManyStates(rel_req_meta_attrs)

    const many_states = {}
    const can_load_more = !value_all_loaded
    statesData(many_states, nesting_name, can_load_more, is_main_list)

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
