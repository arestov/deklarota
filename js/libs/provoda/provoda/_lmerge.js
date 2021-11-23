
import spv from '../../spv'
const cloneObj = spv.cloneObj

export default function mergeBhv(target, source) {
  const originalExtStates = target['attrs']
  const copy = spv.cloneObj(target, source)

  if (originalExtStates && source['attrs']) {
    let newStates = cloneObj({}, originalExtStates)
    newStates = cloneObj(newStates, source['attrs'])
    copy['attrs'] = newStates
  }

  return copy
}
