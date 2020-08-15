define(function(require) {
'use strict'
var spv = require('spv')
var getTargetField = spv.getTargetField
var getNetApiByDeclr = require('../helpers/getNetApiByDeclr')

var getApiPart = function(send_declr, sputnik, app) {
  var network_api = getNetApiByDeclr(send_declr, sputnik, app)
  return !send_declr.api_resource_path
    ? network_api
    : getTargetField(network_api, send_declr.api_resource_path)
}

return getApiPart

})
