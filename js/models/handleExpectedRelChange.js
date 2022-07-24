import getModelById from '../libs/provoda/utils/getModelById'
import getAction from '../libs/provoda/dcl/passes/getAction'
import showMOnMap from '../libs/provoda/bwlev/showMOnMap'
import { FlowStepAction } from '../libs/provoda/Model/flowStepHandlers.types'
import execAction from '../libs/provoda/dcl/passes/execAction'

export const REL_QUERY_TYPE_REL = 0

const handleExpectedRelChange = (chain, current_md) => {
  let complete
  let link_step_value = current_md

  for (let i = 0; i < chain.list.length; i++) {
    const rel_name = chain.list[i].rel

    const requesting_action = `requireRel:${rel_name}`
    const action_dcl = getAction(link_step_value, requesting_action)

    if (!action_dcl) {
      const err = new Error('impossible to request')
      console.error({rel_name}, err)
      throw err
    }

    const value = link_step_value.getNesting(rel_name)
    if (value && (Array.isArray(value) ? value.length : true)) {
      link_step_value = value
      complete = i == chain.list.length - 1
      continue
    }

    const self = link_step_value
    self.nextLocalTick(FlowStepAction, [self, requesting_action], true)
  }


  if (complete) {
    const router = getModelById(current_md, chain.handler_payload.data.router_id)
    execAction(router, 'showModel', link_step_value)
  }
}

export default handleExpectedRelChange
