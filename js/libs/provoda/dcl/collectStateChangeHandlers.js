
import spv from '../../spv'
import { doCopy } from '../../spv/cloneObj'
import getPropsPrefixChecker from '../utils/getPropsPrefixChecker'
const getUnprefixed = spv.getDeprefixFunc('stch-')
const hasPrefixedProps = getPropsPrefixChecker(getUnprefixed)


function checkStchType(fn) {
  if (typeof fn == 'function') {
    return fn
  }

  throw new Error('stch should be fn. old object dcl depricated')
}

export default function(self, props) {
  if (!props.hasOwnProperty('state_change') && !hasPrefixedProps(props)) {
    return
  }

  const result_index = doCopy({}, self.__state_change_index || {})

  for (const lprop in props.state_change) {
    result_index[lprop] = checkStchType(props.state_change[lprop])
  }

  for (const prop_name in props) {
    if (getUnprefixed(prop_name)) {
      const string = getUnprefixed(prop_name)
      if (props.state_change && props.state_change[string]) {
        throw new Error('stch dup for: ' + string)
      }
      result_index[string] = checkStchType(props[prop_name])
    }
  }

  self.__state_change_index = result_index
  return result_index

}
