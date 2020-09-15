import makeKey from '../../../internal_events/makeKey'

var toName = {}
var toValue = {}

var getValueByName = function(key) {
  if (toValue.hasOwnProperty(key)) {
    return toValue[key]
  }

  return null
}

var getNameByValue = function(value) {
  if (toName.hasOwnProperty(value)) {
    return toName[value]
  }

  var key = makeKey(value)
  toName[value] = key
  toValue[key] = value
  return key
}

export default {
  getValueByName: getValueByName,
  getNameByValue: getNameByValue,
}
