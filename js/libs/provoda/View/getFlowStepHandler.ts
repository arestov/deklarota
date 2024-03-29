import type FlowStep from '../FlowStep'
import { ViewFlowStepTickDetailsRequest } from './viewFlowStepHandlers.types'
import { FlowStepEffectsTransactionEnd, FlowStepEraseEffectData, FlowStepExecEffect, FlowStepLegacyStch, FlowStepUseInterface } from '../Model/flowStepHandlers.types'
import { __tickDetRequest } from '../CoreView'
import { useInterfaceHandler } from '../AttrsOwner/useInterface'
import { eraseTransactionEffectsData, handleTransactionEnd } from '../dcl/effects/legacy/produce/scheduleTransactionEnd'
import executeEffect from '../dcl/effects/legacy/produce/executeEffect'
import { proxyStch } from '../handleLegacySideEffects'
import { UniFlowRuntimeInternalFn, UniFlowRuntimeReadyFn, UniFlowStepRuntimeInputFn, UniFlowStepRuntimeOnlyFnWrapped, UniFlowUncertainInternal } from '../CallbacksFlow/UniversalFlowTypes.type'

const getFlowStepHandler = (flow_step: FlowStep): Function | null => {

  switch (flow_step.fnType) {
    case FlowStepLegacyStch:
      return proxyStch
    case ViewFlowStepTickDetailsRequest:
      return __tickDetRequest
    case FlowStepUseInterface:
      return useInterfaceHandler
    case FlowStepEffectsTransactionEnd:
      return handleTransactionEnd
    case FlowStepExecEffect:
      return executeEffect
    case FlowStepEraseEffectData:
      return eraseTransactionEffectsData
    case UniFlowStepRuntimeOnlyFnWrapped:
    case UniFlowStepRuntimeInputFn:
    case UniFlowRuntimeReadyFn:
    case UniFlowUncertainInternal:
    case UniFlowRuntimeInternalFn:
      return flow_step.runtimeFn
  }

  return null

}

export default getFlowStepHandler
