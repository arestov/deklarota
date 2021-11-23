import { doCopy } from '../../spv/cloneObj'
import shallowEqual from '../shallowEqual'

const copyProps = function(original_props_raw, extending_values) {
  if (!extending_values) {
    return original_props_raw
  }

  const original_props = original_props_raw || {}
  const result = {}
  doCopy(result, original_props)
  doCopy(result, extending_values)

  if (shallowEqual(original_props, result)) {
    return original_props
  }

  return result
}

export default copyProps
