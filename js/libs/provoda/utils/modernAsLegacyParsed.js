
var getParsedState = require('./getParsedState')
var asString = require('./multiPath/asString')
var parseMultiPath = require('./multiPath/parse')

var fromMultiPath = getParsedState.fromMultiPath

var getMultiPath = function(full_name) {
  if (full_name && full_name.charAt(0) == '<') {
    return parseMultiPath(full_name)
  }
}

var ensureResult = function(full_name) {
  var multi_path = getMultiPath(full_name)
  if (!multi_path) {
    return null
  }

  return fromMultiPath(multi_path, asString(multi_path), full_name)
}

export default ensureResult
