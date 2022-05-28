import _passHandleState from '../dcl/passes/handleState/handle'
import attrToRel from '../dcl/nests/attrToRel'
import deliverAttrQueryUpdates from './mentions/deliverAttrQueryUpdates'

function ___dkt_onAttrUpdate(state_name, value, total_original_states) {
  const etr = this
  _passHandleState(etr, total_original_states, state_name, value)

  attrToRel(etr, state_name, value)
  deliverAttrQueryUpdates(etr, state_name)
}

export default ___dkt_onAttrUpdate
