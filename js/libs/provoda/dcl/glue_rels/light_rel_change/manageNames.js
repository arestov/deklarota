import makeKey from '../../../internal_events/makeKey'

const toName = {}
const toValue = {}

const getValueByName = function(key) {
  if (toValue.hasOwnProperty(key)) {
    return toValue[key]
  }

  return null
}

const getNameByValue = function(value) {
  if (toName.hasOwnProperty(value)) {
    return toName[value]
  }

  const key = makeKey(value)
  toName[value] = key
  toValue[key] = value
  return key
}

export default {
  getValueByName: getValueByName,
  getNameByValue: getNameByValue,
}
