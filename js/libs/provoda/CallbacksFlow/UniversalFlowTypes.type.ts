
/*
  "action" is operations with state like 'updateAttr' or 'updateRel' or 'dispatch'
*/
export const UniFlowStepRuntimeInputFn = 1 as const
export const UniFlowRuntimeReadyFn = 2 as const
export const UniFlowUncertainInternal = 3 as const /* should be review if payload is action */
export const UniFlowRuntimeInternalFn = 4 as const /* payload is not action. only for runtime */

export const UniFlowStepRuntimeOnlyFnWrapped = 5 as const
