import type FlowStep from '../FlowStep'

const callFlowStep = (flow_step: FlowStep): void => {


  if (flow_step.cb_wrapper != null) {
    /*
    вместо того, что бы просто выполнить отложенную функцию мы можем вызвать специальный обработчик, который сможет сделать некие действиями, имея в распоряжении
    в первую очередь мотиватор, далее контекст для самого себя, контекст колбэка, сам колбэк и аргументы для колбэка

    */
    flow_step.cb_wrapper.call(flow_step.real_context, flow_step, flow_step.fn, flow_step.context, flow_step.args, flow_step.arg)
    return
  }

  const { fn } = flow_step

  if (fn == null) {
    throw new Error('how to handle this step!?')
  }

  if (flow_step.args == null) {
    fn.call(flow_step.context, flow_step.arg)
    return
  }

  fn.apply(flow_step.context, flow_step.args)
  return
}

export default callFlowStep
