import getModelById from '../libs/provoda/utils/getModelById'
import getAction from '../libs/provoda/dcl/passes/getAction'
import showMOnMap from '../libs/provoda/bwlev/showMOnMap'

const handleExpectedRelChange = (chain, current_md) => {
  let complete
  let link_step_value = current_md

  for (var i = 0; i < chain.list.length; i++) {
    const rel_name = chain.list[i].rel
    const value = link_step_value.getNesting(rel_name)
    if (value && (Array.isArray(value) ? value.length : true)) {
      link_step_value = value
      complete = i == chain.list.length - 1
      continue
    }
    const requesting_action = `requireRel:${rel_name}`
    const action_dcl = getAction(link_step_value, requesting_action)

    if (!action_dcl) {
      const err = new Error('impossible to request')
      console.error({rel_name}, err)
      throw err
    }

    const self = link_step_value
    self.nextLocalTick(self.__act, [self, requesting_action], true)
  }


  if (complete) {
    const router = getModelById(current_md, chain.handler_payload.data.router_id)
    var bwlev = showMOnMap(current_md.app.CBWL, router, link_step_value)
    bwlev.showOnMap()
  }
}

export default handleExpectedRelChange
