define(function(require) {
'use strict'
var hex_md5 = require('hex_md5');
var extendPromise = require('js/modules/extendPromise');
var spv = require('spv');
var getApiPart = require('./getApiPart')
var getTargetField = spv.getTargetField;
var toBigPromise = extendPromise.toBigPromise;
var hp = require('../helpers');
var batching = require('./batching')
var doBatch = batching


var usualRequest = function (send_declr, sputnik, opts, network_api_opts) {
  var api_name = send_declr.api_name;
  var api_method = send_declr.api_method_name;
  var api_args = send_declr.getArgs.call(sputnik, opts);
  var manual_nocache = api_args[2] && api_args[2].nocache;

  var non_standart_api_opts = send_declr.non_standart_api_opts;

  if (!non_standart_api_opts) {
    api_args[2] = api_args[2] || network_api_opts;
  }

  var cache_key;
  if (!non_standart_api_opts && !manual_nocache) {
    var big_string = JSON.stringify([
      'usual', api_name, send_declr.api_resource_path, api_method, api_args
    ]);
    cache_key = hex_md5(big_string);
  }


  return {
    cache_key: cache_key,
    data: api_args
  };
};

var manualRequest = function (send_declr, sputnik, opts) {
  var declr = send_declr.manual;
  var api_name = send_declr.api_name;

  var args = new Array(declr.dependencies + 2);

  args[0] = null;
  args[1] = opts;

  for (var i = 0; i < declr.dependencies.length; i++) {
    args[i+2] = sputnik.state(declr.dependencies[i]);
  }

  var cache_key = hex_md5(JSON.stringify([
    'manual', api_name, send_declr.api_resource_path, opts, declr.fn_body, args
  ]));

  return {
    cache_key: cache_key,
    data: args
  };
};



var idsRequest = function (send_declr, sputnik) {
  var declr = send_declr.ids_declr;
  var api_name = send_declr.api_name;

  var ids = sputnik.state(declr.arrayof);

  var cache_key = hex_md5(JSON.stringify([
    'ids', api_name, send_declr.api_resource_path, declr.fn_body, ids
  ]));

  return {
    cache_key: cache_key,
    data: ids
  };

  // var states = new Array();
  // arrayof: 'user_id',
  // indexBy: '_id',
  // req: function(api, ids) {
  // 	return api.find({_id: {'$in': ids}}).limit(ids.length);
  // }
};

var oneFromList = function(array) {
  return array && array[0];
};






var getRequestByDeclr = function(send_declr, sputnik, opts, network_api_opts) {
  if (!sputnik._highway.requests_by_declarations) {
    sputnik._highway.requests_by_declarations = {};
  }
  var requests_by_declarations = sputnik._highway.requests_by_declarations;


  var network_api = hp.getNetApiByDeclr(send_declr, sputnik);
  var api_part = getApiPart(send_declr, sputnik);

  if (!network_api) {
    throw new Error('network_api must present!');
  }


  if (!network_api.source_name) {
    throw new Error('network_api must have source_name!');
  }

  if (!network_api.errors_fields && !network_api.checkResponse) {
    throw new Error('provide a way to detect errors!');
  }

  var api_name = send_declr.api_name;
  if (typeof api_name != 'string') {
    api_name = network_api.api_name;
  }

  if (typeof api_name != 'string') {
    throw new Error('network_api must have api_name!');
  }

  var request_data;
  if (send_declr.api_method_name) {
    request_data = usualRequest(send_declr, sputnik, opts, network_api_opts);
  } else if (send_declr.manual) {
    request_data = manualRequest(send_declr, sputnik, opts);
  } else if (send_declr.ids_declr) {
    request_data = idsRequest(send_declr, sputnik);
  }

  var cache_key = request_data.cache_key;
  if (cache_key && !opts.has_error && requests_by_declarations[cache_key]) {
    return requests_by_declarations[cache_key];
  }


  var request;
  if (send_declr.api_method_name) {
    request = api_part[ send_declr.api_method_name ].apply(network_api, request_data.data);
  } else if (send_declr.manual) {
    request_data.data[0] = api_part;
    request = send_declr.manual.fn.apply(null, request_data.data);
  } else if (send_declr.ids_declr) {
    if (sputnik._highway.reqs_batching.is_processing) {
      request = doBatch(sputnik._highway.reqs_batching, send_declr, request_data.data);
    } else {
      request = send_declr.ids_declr.req.call(null, api_part, [request_data.data])
        .then(oneFromList);
    }

    //  idsRequest(send_declr, sputnik, opts);
  }

  var result_request = checkRequest(request);
  result_request.network_api = network_api;
  if (cache_key) {
    requests_by_declarations[cache_key] = result_request;
    result_request.then(anyway, anyway);
  }

  return result_request;

  function anyway() {
    if (requests_by_declarations[cache_key] == request) {
      delete requests_by_declarations[cache_key];
    }
  }
};

function checkRequest(request) {
  if (!request.catch) {
    if (!request.abort && !request.db) {
      throw new Error('request must have `abort` method');
    }
    return toBigPromise(request);
  }
  return request;
}


function findErrorByList(data, errors_selectors) {
  var i, cur, has_error;
  for (i = 0; i < errors_selectors.length; i++) {
    cur = errors_selectors[i];
    has_error = getTargetField(data, cur);
    if (has_error){
      break;
    }
  }
  return has_error;
}

function onPromiseFail(promise, cb) {
  if (promise.fail) {
    return promise.fail(cb);
  } else {
    return promise.catch(cb);
  }
}


return {
  getRequestByDeclr: getRequestByDeclr,
  findErrorByList: findErrorByList,
  onPromiseFail: onPromiseFail,
}
})
