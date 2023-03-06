import initDeclaredNestings from '../dcl/nest/runtime/initDeclaredNestings'
import type FlowStep from '../FlowStep'
import { proxyStch } from '../handleLegacySideEffects'
import act from '../dcl/passes/execAction'
import { useInterfaceHandler } from '../AttrsOwner/useInterface'
import { FlowStepAction, FlowStepDeliverChainUpdates, FlowStepEffectsTransactionEnd, FlowStepEraseEffectData, FlowStepExecEffect, FlowStepHandlRelSideDataLegacy, FlowStepInitNestRels, FlowStepLegacyStch, FlowStepMarkInited, FlowStepShowInPerspectivator, FlowStepUpdateManyAttrs, FlowStepUseInterface } from './flowStepHandlers.types'
import { markInitied } from './postInit'
import deliverChainUpdates from './mentions/deliverChainUpdates'
import { eraseTransactionEffectsData, handleTransactionEnd } from '../dcl/effects/legacy/produce/scheduleTransactionEnd'
import executeEffect from '../dcl/effects/legacy/produce/executeEffect'
import { __updateManyAttrs } from '../AttrsOwner/AttrsOwner'
import { handleNetworkSideData } from '../provoda/LoadableList'
import { showInPerspectivator } from '../bwlev/router_handlers'
import { UniFlowRuntimeInternalFn, UniFlowRuntimeReadyFn, UniFlowStepRuntimeInputFn, UniFlowStepRuntimeOnlyFnWrapped, UniFlowUncertainInternal } from '../CallbacksFlow/UniversalFlowTypes.type'

const getFlowStepHandler = (flow_step: FlowStep): Function | null => {

  switch (flow_step.fnType) {
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
    case FlowStepShowInPerspectivator:
      return showInPerspectivator
    case UniFlowStepRuntimeOnlyFnWrapped:
    case UniFlowStepRuntimeInputFn:
    case UniFlowRuntimeReadyFn:
    case UniFlowUncertainInternal:
    case UniFlowRuntimeInternalFn:
      return flow_step.runtimeFn
  }

  return null

}

export const isRuntimeFn = (flow_step: FlowStep) : boolean => {
  switch (flow_step.fnType) {
    case UniFlowStepRuntimeOnlyFnWrapped:
    case UniFlowStepRuntimeInputFn:
    case UniFlowRuntimeReadyFn:
    case UniFlowUncertainInternal:
    case UniFlowRuntimeInternalFn:
      return true
  }
  return false
}

export default getFlowStepHandler
