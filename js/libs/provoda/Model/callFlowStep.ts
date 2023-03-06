import type FlowStep from '../FlowStep'
import makeCallFlowStep from '../makeCallFlowStep'
import getFlowStepHandler, { isRuntimeFn } from './getFlowStepHandler'

const assertComplexOrder = (flow_step: FlowStep): void => {
  const {runtimeFn, complex_order} = flow_step

  if (!isRuntimeFn(flow_step)) {
    if (runtimeFn) {
      console.log('you should not have runtimeFn', flow_step.fnType, flow_step.runtimeFn,)
      throw new Error('you should not have runtimeFn')
    }
    return
  } else {
    if (!runtimeFn) {
      throw new Error('you should have runtimeFn')
    }
  }

  if (complex_order.length == 1) {
    return
  }
  if (complex_order.length == 2 && complex_order[0] == Infinity) {
    return
  }
  console.log(getFlowStepHandler(flow_step) || flow_step.runtimeFn)
  console.warn('fn can be used for input only', complex_order, runtimeFn)
  throw new Error('fn can be used for input only')
}

export const validateFlowStep = (flow_step: FlowStep): void => {
  assertComplexOrder(flow_step)
  const fn = getFlowStepHandler(flow_step)
  if (fn == null || typeof fn === 'number') {
    console.log(fn)
    throw new Error('how to handle this step!?')
  }
}


const getFn = (flow_step: FlowStep): Function => {
  assertComplexOrder(flow_step)

  const fn = getFlowStepHandler(flow_step)

  if (fn == null || typeof fn === 'number') {
    console.log(fn)
    throw new Error('how to handle this step!?')
  }

  return fn
}
const callFlowStep = makeCallFlowStep(getFn)

export default callFlowStep
