import type FlowStep from '../FlowStep'
import makeCallFlowStep from '../makeCallFlowStep'
import getFlowStepHandler from './getFlowStepHandler'

const getFn = (flow_step: FlowStep): Function => {

  const fn = getFlowStepHandler(flow_step) || flow_step.fn

  if (fn == null || typeof fn === 'number') {
    console.log('fn', fn)
    throw new Error('how to handle this step!? ' + fn)
  }

  return fn
}
const callFlowStep = makeCallFlowStep(getFn)

export default callFlowStep