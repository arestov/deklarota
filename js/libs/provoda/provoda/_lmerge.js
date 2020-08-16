
import spv from 'spv'
var cloneObj = spv.cloneObj

export default function mergeBhv(target, source) {
  var originalExtStates = target['attrs']
  var copy = spv.cloneObj(target, source)

  if (originalExtStates && source['attrs']) {
    var newStates = cloneObj({}, originalExtStates)
    newStates = cloneObj(newStates, source['attrs'])
    copy['attrs'] = newStates
  }

  return copy
}
