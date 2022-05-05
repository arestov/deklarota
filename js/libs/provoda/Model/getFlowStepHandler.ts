import initDeclaredNestings from '../dcl/nest/runtime/initDeclaredNestings'
import type FlowStep from '../FlowStep'
import { proxyStch } from '../handleLegacySideEffects'
import act from '../dcl/passes/act'
import { useInterfaceHandler } from '../StatesEmitter/useInterface'
import { FlowStepAction, FlowStepDeliverChainUpdates, FlowStepInitNestRels, FlowStepLegacyStch, FlowStepMarkInited, FlowStepUseInterface } from './flowStepHandlers.types'
import { markInitied } from './postInit'
import deliverChainUpdates from './mentions/deliverChainUpdates'

const getFlowStepHandler = (flow_step: FlowStep): Function | null => {

  switch (flow_step.fn) {
    case FlowStepLegacyStch:
      return proxyStch
    case FlowStepInitNestRels:
      return initDeclaredNestings
    case FlowStepUseInterface:
      return useInterfaceHandler
    case FlowStepMarkInited:
      return markInitied
    case FlowStepAction:
      return act
    case FlowStepDeliverChainUpdates:
      return deliverChainUpdates
  }

  return null

}

export default getFlowStepHandler
