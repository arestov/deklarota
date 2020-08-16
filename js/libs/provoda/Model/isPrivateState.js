
var spv = require('spv')
var parse = require('../utils/multiPath/parse')
var memorize = spv.memorize
var isPrivate = memorize(function(str) {
  if (str.startsWith('__') || str.startsWith('@')) {
    return true
  }

  if (str.startsWith('_api_') || str.startsWith('_apis_') || str.startsWith('_triggered_api_')) {
    return true
  }

  if (str.startsWith('_need_api')) {
    return true
  }

  if (str.startsWith('$meta$apis$')) {
    return true
  }

  var parsed = parse(str, true)

  if (parsed.result_type != 'state') {
    return true
  }

  if ((parsed.nesting && parsed.nesting.path) || (parsed.resource && parsed.resource.path) || (parsed.from_base && parsed.from_base.type)) {
    return true
  }

  return false
})
export default isPrivate
