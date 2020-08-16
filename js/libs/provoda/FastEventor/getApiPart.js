
import spv from '../../spv'
import getNetApiByDeclr from '../helpers/getNetApiByDeclr'
var getTargetField = spv.getTargetField

var getApiPart = function(send_declr, sputnik, app) {
  var network_api = getNetApiByDeclr(send_declr, sputnik, app)
  return !send_declr.api_resource_path
    ? network_api
    : getTargetField(network_api, send_declr.api_resource_path)
}

export default getApiPart
