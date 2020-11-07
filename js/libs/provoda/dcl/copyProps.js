import cloneObj from '../../spv/cloneObj'

var copyProps = function(original_props_raw, extending_values) {
  if (!extending_values) {
    return original_props_raw
  }

  var original_props = original_props_raw || {}
  var result = cloneObj({}, original_props)
  return cloneObj(result, extending_values)
}

export default copyProps
