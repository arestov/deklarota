import type FlowStep from '../FlowStep'
import makeCallFlowStep from '../makeCallFlowStep'
import getFlowStepHandler from './getFlowStepHandler'

export const validateFlowStep = (flow_step: FlowStep): void => {
  const fn = getFlowStepHandler(flow_step) || flow_step.runtimeFn
  if (fn == null) {
    throw new Error('how to handle this step!?')
  }
}


const getFn = (flow_step: FlowStep): Function => {

  const fn = getFlowStepHandler(flow_step) || flow_step.runtimeFn

  if (fn == null || typeof fn === 'number') {
    console.log('fn', fn)
    throw new Error('how to handle this step!? ' + fn)
  }

  return fn
}
const callFlowStep = makeCallFlowStep(getFn)

export default callFlowStep
