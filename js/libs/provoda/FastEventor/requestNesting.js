import req_utils from './req-utils'
import types from './nestReqTypes'
import getNetApiByDeclr from '../helpers/getNetApiByDeclr'

var getRequestByDeclr = req_utils.getRequestByDeclr
var findErrorByList = req_utils.findErrorByList


var clean_obj = {}


function nestingMark(nesting_name, name) {
  return '$meta$nests$' + nesting_name + '$' + name
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

  var now = Date.now()
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

  states[nestingMark(nesting_name, types.all_loaded)] = true
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

export default function(dclt, nesting_name, limit) {
  // 'loading_nesting_' + nesting_name
  // nesting_name + '$loading'
  // 'main_list_loading', true
  // nesting_name + "$error"
  // nesting_name + '$waiting_queue'


  if (!dclt) {
    return
  }
  if (!this.nesting_requests) {
    this.nesting_requests = {}
  }

  if (!this.nesting_requests[ nesting_name ]) {
    this.nesting_requests[ nesting_name ] = {
      //has_items: false,
      has_all_items: false,
      last_page: 0,
      error: false,
      process: false,
      req: null,
    }
  }

  var store = this.nesting_requests[ nesting_name ]
  if (store.process || store.has_all_items) {
    return
  }
  var _this = this

  var isValidRequest = function(req) {
    var store = _this.nesting_requests[nesting_name]
    return store && store.req == req
  }

  var is_main_list = nesting_name == this.sputnik.main_list_name

  this.sputnik.input(function() {
    var states = {}
    statesStart(states, nesting_name, is_main_list)
    _this.sputnik.updateManyStates(states)
  })

  var parse_items = dclt.parse_items
  var parse_serv = dclt.parse_serv
  var side_data_parsers = dclt.side_data_parsers

  var supports_paging = !!parse_serv
  var limit_value = limit && (limit[1] - limit[0])
  var paging_opts = this.sputnik.getPagingInfo(nesting_name, limit_value)

  var network_api_opts = {
    nocache: store.error
  }

  if (supports_paging) {
    network_api_opts.paging = paging_opts
  }


  var send_declr = dclt.send_declr

  if (!getNetApiByDeclr(send_declr, this.sputnik)) {
    console.warn(new Error('api not ready yet'), send_declr)
    return
  }


  var request = getRequestByDeclr(send_declr, this.sputnik,
    {has_error: store.error, paging: paging_opts},
    network_api_opts)
  var network_api = request.network_api
  var source_name = request.source_name

  store.process = true
  store.req = request

  function markAttemptComplete() {
    var states = {}
    statesComplete(states, nesting_name)
    _this.sputnik.nextTick(_this.sputnik.updateManyStates, [states], true)
  }

  function anyway() {
    store.process = false
    if (store.req == request) {
      store.req = null
    }

    var states = {}
    statesAnyway(states, nesting_name, is_main_list)
    _this.sputnik.nextTick(_this.sputnik.updateManyStates, [states], true)
  }

  function handleError() {
    store.error = true
    var states = {}
    statesError(states, nesting_name)
    _this.sputnik.nextTick(_this.sputnik.updateManyStates, [states], true)

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
    var changeWaitingState = (value) => () => {
      if (!isValidRequest(request)) {
        return
      }
      _this.sputnik.updateManyStates(statesQueue({}, nesting_name, value))
    }

    const startWaiting = changeWaitingState(true)
    this.sputnik.input(startWaiting)

    const stopWaiting = changeWaitingState(false)
    request.queued_promise.then(stopWaiting, stopWaiting)
  }

  request
  .then(function(response) {
    var has_error = detectError(response)
    if (has_error) {
      return [has_error, response, source_name]
    }

    return [false, response, source_name]
  })
  .then(function(wrapped_response) {
    const [has_error, response, source_name] = wrapped_response

    if (!isValidRequest(request)) {
      return
    }

    if (has_error) {
      _this.sputnik.input(handleError)
      return
    }

    _this.sputnik.input(function() {
      store.error = false
      store.has_all_items = true
      handleNestResponse(response, source_name, function() {
        store.has_all_items = false
      })
      anyway()
      markAttemptComplete()
    })

  }, function() {
    if (!isValidRequest(request)) {
      return
    }

    _this.sputnik.input(handleError)


  })

  function detectError(resp) {
    var has_error = network_api.errors_fields
      ? findErrorByList(resp, network_api.errors_fields)
      : network_api.checkResponse(resp)

    return has_error
  }

  function handleNestResponse(r, source_name, markListIncomplete) {
    // should be in data bus queue - use `.input` wrap
    var sputnik = _this.sputnik

    var morph_helpers = sputnik.app.morph_helpers
    var items = parse_items.call(sputnik, r, clean_obj, morph_helpers)
    var serv_data = typeof parse_serv == 'function' && parse_serv.call(sputnik, r, paging_opts, morph_helpers)
    var can_load_more = supports_paging && hasMoreData(serv_data, limit_value, paging_opts, items)

    if (can_load_more) {
      markListIncomplete()
    }

    var many_states = {}
    statesData(many_states, nesting_name, can_load_more, is_main_list)

    items = paging_opts.remainder ? items.slice(paging_opts.remainder) : items

    sputnik.insertDataAsSubitems(sputnik, nesting_name, items, serv_data, source_name)

    sputnik.nextTick(sputnik.updateManyStates, [many_states], true)

    if (!sputnik.loaded_nestings_items) {
      sputnik.loaded_nestings_items = {}
    }

    if (!sputnik.loaded_nestings_items[nesting_name]) {
      sputnik.loaded_nestings_items[nesting_name] = 0
    }
    var has_data_holes = serv_data === true || (serv_data && serv_data.has_data_holes === true)

    sputnik.loaded_nestings_items[nesting_name] +=
      has_data_holes ? paging_opts.page_limit : (items ? items.length : 0)
    //special logic where server send us page without few items. but it can be more pages available
    //so serv_data in this case is answer for question "Is more data available?"

    if (!side_data_parsers) {return}

    for (var i = 0; i < side_data_parsers.length; i++) {
      sputnik.nextTick(
        sputnik.handleNetworkSideData, [
          sputnik,
          source_name,
          side_data_parsers[i][0],
          side_data_parsers[i][1].call(sputnik, r, paging_opts, morph_helpers)
        ], true)
    }

    //сделать выводы о завершенности всех данных
  }

  this.addRequest(request)
  return request

  /*
  есть ли декларация
  все ли возможные данные получены
  в процессе запроса (пока можно запрашивать в один поток)


  маркировка ошибок с прошлых запросов не участвует в принятиях решений, но используется для отказа от кеша при новых запросах


  */
}


function hasMoreData(serv_data, page_limit, paging_opts, items) {
  if (serv_data === true) {
    return true
  } else if (serv_data && ((serv_data.hasOwnProperty('total_pages_num') && serv_data.hasOwnProperty('page_num')) || serv_data.hasOwnProperty('total'))) {
    if (!isNaN(serv_data.total)) {
      if ((paging_opts.current_length + items.length) < serv_data.total && serv_data.total > paging_opts.page_limit) {
        return true
      }
    } else {
      if (serv_data.page_num < serv_data.total_pages_num) {
        return true
      }
    }

  } else {
    return items.length == page_limit
  }

}
