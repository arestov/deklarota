import type FlowStep from '../FlowStep'
import makeCallFlowStep from '../makeCallFlowStep'
import getFlowStepHandler from './getFlowStepHandler'

const assertComplexOrder = (fn: Function | null | number, complex_order: readonly number[]): void => {
  if (typeof fn != 'function' || complex_order.length == 1) {
    return
  }
  if (complex_order.length == 2 && complex_order[0] == Infinity) {
    return
  }
  console.warn('fn can be used for input only', complex_order, fn)
  throw new Error('fn can be used for input only')
}

export const validateFlowStep = (flow_step: FlowStep): void => {
  assertComplexOrder(flow_step.fn, flow_step.complex_order)
  const fn = getFlowStepHandler(flow_step) || flow_step.fn
  if (fn == null) {
    throw new Error('how to handle this step!?')
  }
}


const getFn = (flow_step: FlowStep): Function => {
  assertComplexOrder(flow_step.fn, flow_step.complex_order)

  const fn = getFlowStepHandler(flow_step) || flow_step.fn

  if (fn == null || typeof fn === 'number') {
    throw new Error('how to handle this step!?')
  }

  return fn
}
const callFlowStep = makeCallFlowStep(getFn)

export default callFlowStep
