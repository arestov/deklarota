
import Promise from '../../../common-libs/Promise-3.1.0.mod'
import extendPromise from '../../../modules/extendPromise'
import spv from '../../spv'
import getApiPart from './getApiPart'
import getNetApiByDeclr from '../helpers/getNetApiByDeclr'
const getTargetField = spv.getTargetField
const toBigPromise = extendPromise.toBigPromise


const usualRequest = function(send_declr, sputnik, opts, network_api_opts) {
  const api_name = send_declr.api_name
  const allow_cache = send_declr.allow_cache === true
  const api_method = send_declr.api_method_name
  const api_args = send_declr.getArgs.call(sputnik, opts)
  const manual_nocache = api_args[2] && api_args[2].nocache

  const non_standart_api_opts = send_declr.non_standart_api_opts

  if (!non_standart_api_opts) {
    api_args[2] = api_args[2] || network_api_opts
  }

  let cache_key
  if (allow_cache && !non_standart_api_opts && !manual_nocache) {
    cache_key = [
      'usual', api_name, send_declr.api_resource_path, api_method, api_args
    ]
  }


  return {
    cache_key: cache_key,
    data: api_args
  }
}

const manualRequest = function(send_declr, sputnik, opts) {
  const declr = send_declr.manual
  const api_name = send_declr.api_name
  const allow_cache = send_declr.allow_cache === true

  const args = new Array(declr.dependencies + 2)

  args[0] = null
  args[1] = opts

  for (let i = 0; i < declr.dependencies.length; i++) {
    args[i + 2] = sputnik.state(declr.dependencies[i])
  }

  const cache_key = allow_cache && [
    'manual', api_name, send_declr.api_resource_path, opts, declr.fn_body, args
  ]

  return {
    cache_key: cache_key,
    data: args
  }
}



const getRequestByDeclr = function(send_declr, sputnik, opts, network_api_opts) {
  if (!sputnik._highway.requests_by_declarations) {
    sputnik._highway.requests_by_declarations = {}
  }
  const requests_by_declarations = sputnik._highway.requests_by_declarations


  const network_api = getNetApiByDeclr(send_declr, sputnik)
  const api_part = getApiPart(send_declr, sputnik)

  if (!network_api) {
    const error = new Error('network_api must present!')
    console.error(error, send_declr, sputnik.hierarchy_path, sputnik.__code_path)
    throw error
  }


  if (!network_api.source_name) {
    throw new Error('network_api must have source_name!')
  }

  if (!network_api.errors_fields && !network_api.checkResponse) {
    throw new Error('provide a way to detect errors!')
  }

  let api_name = send_declr.api_name
  if (typeof api_name != 'string') {
    api_name = network_api.api_name
  }

  if (typeof api_name != 'string') {
    throw new Error('network_api must have api_name!')
  }

  let request_data
  if (send_declr.api_method_name) {
    request_data = usualRequest(send_declr, sputnik, opts, network_api_opts)
  } else if (send_declr.manual) {
    request_data = manualRequest(send_declr, sputnik, opts)
  }

  const cache_key = request_data.cache_key
  if (cache_key && !opts.has_error && requests_by_declarations[cache_key]) {
    return requests_by_declarations[cache_key]
  }


  let request
  if (send_declr.api_method_name) {
    request = api_part[ send_declr.api_method_name ].apply(network_api, request_data.data)
  } else if (send_declr.manual) {
    request_data.data[0] = api_part
    request = send_declr.manual.fn.apply(null, request_data.data)
  }

  const result_request = checkRequest(request)
  result_request.network_api = network_api
  result_request.source_name = network_api.source_name
  if (cache_key) {
    requests_by_declarations[cache_key] = result_request
    result_request.then(anyway, anyway)
  }

  return result_request

  function anyway() {
    if (requests_by_declarations[cache_key] == request) {
      delete requests_by_declarations[cache_key]
    }
  }
}

function checkRequest(request) {
  if (!request) {
    return Promise.reject(new Error('not-requested'))
  }
  if (!request.catch) {
    if (!request.abort && !request.db) {
      throw new Error('request must have `abort` method')
    }
    return toBigPromise(request)
  }
  return request
}


function findErrorByList(data, errors_selectors) {
  let i
  for (i = 0; i < errors_selectors.length; i++) {
    const cur = errors_selectors[i]
    const has_error = getTargetField(data, cur)
    if (has_error) {
      return has_error
    }
  }
}

function onPromiseFail(promise, cb) {
  if (promise.catch) {
    return promise.catch(cb)
  }

  return promise.fail(cb)
}


export default {
  getRequestByDeclr: getRequestByDeclr,
  findErrorByList: findErrorByList,
  onPromiseFail: onPromiseFail,
}
