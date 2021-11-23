
import spv from '../../spv'
import parse from '../utils/multiPath/parse'
const memorize = spv.memorize
const isPrivate = memorize(function(str) {
  if (typeof str === 'symbol') {
    return true
  }

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

  const parsed = parse(str, true)

  if (parsed.result_type != 'state') {
    return true
  }

  if ((parsed.nesting && parsed.nesting.path) || (parsed.resource && parsed.resource.path) || (parsed.from_base && parsed.from_base.type)) {
    return true
  }

  return false
})
export default isPrivate
