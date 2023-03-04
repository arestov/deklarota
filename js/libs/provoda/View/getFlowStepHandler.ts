import type FlowStep from '../FlowStep'
import { ViewFlowStepTickDetailsRequest } from './viewFlowStepHandlers.types'
import { FlowStepEffectsTransactionEnd, FlowStepEraseEffectData, FlowStepExecEffect, FlowStepLegacyStch, FlowStepUseInterface } from '../Model/flowStepHandlers.types'
import { __tickDetRequest } from '../CoreView'
import { useInterfaceHandler } from '../AttrsOwner/useInterface'
import { eraseTransactionEffectsData, handleTransactionEnd } from '../dcl/effects/legacy/produce/scheduleTransactionEnd'
import executeEffect from '../dcl/effects/legacy/produce/executeEffect'
import { proxyStch } from '../handleLegacySideEffects'
import { UniFlowStepRuntimeOnlyFnWrapped } from '../CallbacksFlow/UniversalFlowTypes.type'

const getFlowStepHandler = (flow_step: FlowStep): Function | null => {

  switch (flow_step.fn) {
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
      return Function.prototype
  }

  return null

}

export default getFlowStepHandler
