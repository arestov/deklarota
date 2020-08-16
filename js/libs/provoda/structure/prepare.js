
import mark from './mark'
import spv from '../../spv'

export default function prepare(root) {
  var augmented = spv.inh(root, {}, {})
  return mark(augmented, augmented, null)
}
