
import mark from './mark'
import spvExtend from '../../spv/inh'

export default function prepare(root) {
  const augmented = spvExtend(root, {}, {})
  return mark(augmented, augmented, 0, null)
}
