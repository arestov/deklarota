import triggerLightAttrChange from '../internal_events/light_attr_change/trigger'

function ___dkt_onAttrUpdate(state_name, value) {
  const etr = this
  triggerLightAttrChange(etr, state_name, value)

}

export default ___dkt_onAttrUpdate
