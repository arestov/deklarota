
import spv from '../../../spv'
const cloneObj = spv.cloneObj

function allStates(main_states, extra_states) {
  if (!main_states) {
    return extra_states || {}
  }
  cloneObj(main_states, extra_states)
  return main_states
}

export default allStates
