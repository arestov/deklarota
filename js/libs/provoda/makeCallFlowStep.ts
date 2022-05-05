import type FlowStep from './FlowStep'

const makeCallFlowStep = (getFn: Function) => (flow_step: FlowStep): void => {

  const fn = getFn(flow_step)

  const cb_wrapper = flow_step.cb_wrapper

  if (cb_wrapper && typeof cb_wrapper != 'function') {
    throw new Error()
  }


  if (typeof cb_wrapper == 'function') {
    /*
    вместо того, что бы просто выполнить отложенную функцию мы можем вызвать специальный обработчик, который сможет сделать некие действиями, имея в распоряжении
    в первую очередь мотиватор, далее контекст для самого себя, контекст колбэка, сам колбэк и аргументы для колбэка

    */
    cb_wrapper.call(flow_step.real_context, flow_step, fn, flow_step.context, flow_step.args, flow_step.arg)
    return
  }

  if (flow_step.args == null) {
    fn.call(flow_step.context, flow_step.arg)
    return
  }

  fn.apply(flow_step.context, flow_step.args)
  return
}

export default makeCallFlowStep
