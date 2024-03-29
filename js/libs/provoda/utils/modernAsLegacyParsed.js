
import { fromMultiPath } from './getParsedState'
import asString from './multiPath/asString'
import parseMultiPath from './multiPath/parse'

const getMultiPath = function(full_name) {
  if (full_name && full_name.charAt(0) == '<') {
    return parseMultiPath(full_name)
  }
}

const ensureResult = function(full_name) {
  const multi_path = getMultiPath(full_name)
  if (!multi_path) {
    return null
  }

  return fromMultiPath(multi_path, asString(multi_path), full_name)
}

export default ensureResult
