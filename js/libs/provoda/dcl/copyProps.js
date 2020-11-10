import cloneObj from '../../spv/cloneObj'
import shallowEqual from '../shallowEqual'

var copyProps = function(original_props_raw, extending_values) {
  if (!extending_values) {
    return original_props_raw
  }

  var original_props = original_props_raw || {}
  var result = {}
  cloneObj(result, original_props)
  cloneObj(result, extending_values)

  if (shallowEqual(original_props, result)) {
    return original_props
  }

  return result
}

export default copyProps
