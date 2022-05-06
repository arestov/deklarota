import initDeclaredNestings from '../dcl/nest/runtime/initDeclaredNestings'
import type FlowStep from '../FlowStep'
import { proxyStch } from '../handleLegacySideEffects'
import act from '../dcl/passes/act'
import { useInterfaceHandler } from '../AttrsOwner/useInterface'
import { FlowStepAction, FlowStepDeliverChainUpdates, FlowStepEffectsTransactionEnd, FlowStepEraseEffectData, FlowStepExecEffect, FlowStepHandlRelSideDataLegacy, FlowStepInitNestRels, FlowStepLegacyStch, FlowStepMarkInited, FlowStepUpdateManyAttrs, FlowStepUseInterface } from './flowStepHandlers.types'
import { markInitied } from './postInit'
import deliverChainUpdates from './mentions/deliverChainUpdates'
import { eraseTransactionEffectsData, handleTransactionEnd } from '../dcl/effects/legacy/produce/scheduleTransactionEnd'
import executeEffect from '../dcl/effects/legacy/produce/executeEffect'
import { __updateManyAttrs } from '../StatesEmitter'
import { handleNetworkSideData } from '../provoda/LoadableList'

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
    case FlowStepEffectsTransactionEnd:
      return handleTransactionEnd
    case FlowStepExecEffect:
      return executeEffect
    case FlowStepEraseEffectData:
      return eraseTransactionEffectsData
    case FlowStepUpdateManyAttrs:
      return __updateManyAttrs
    case FlowStepHandlRelSideDataLegacy:
      return handleNetworkSideData
  }

  return null

}

export default getFlowStepHandler
