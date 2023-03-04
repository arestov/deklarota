

import FlowStep from './FlowStep'
import orderFlow from './CallbacksFlow/order'
import { getBoxedSetImmFunc } from './CallbacksFlow/getBoxedSetImmFunc'
import { getBoxedRAFFunc } from './CallbacksFlow/getBoxedRAFFunc'
import type { TickFn } from './CallbacksFlow/tick.types'

const MIN = 60 * 1000

class CallbacksFlow {
  // private flow: FlowStep[] = [];
  public flow_start: FlowStep | null = null;
  public flow_end: FlowStep | null = null;
  private callbacks_busy = false;
  private iteration_time: number;
  private iteration_delayed_check_time = 0;
  private flow_steps_counter = 1;
  private bad_stops_strike_counter = 0;
  private current_step: FlowStep | null = null;
  hndIterateCallbacksFlow: () => void
  callFlowStep: (flowStep: FlowStep, aborted?: boolean) => void
  validateFlowStep: (flowStep: FlowStep) => void
  onFinalTransactionStep: ((flowStep: FlowStep) => void)
  pushIteration: TickFn
  reportLongTask: ((step: FlowStep, duration: number) => void) | null
  reportHugeQueue: ((step: FlowStep, duration: number) => void) | null
  constructor(options: {
    callFlowStep: (flowStep: FlowStep, aborted?: boolean) => void;
    validateFlowStep: (flowStep: FlowStep) => void
    glo: Window | typeof globalThis;
    rendering_flow?: boolean;
    iteration_time?: number;
    onError: (error: Error) => void;
    reportLongTask?: (step: FlowStep, duration: number) => void;
    reportHugeQueue?: (step: FlowStep, duration: number) => void;
    onFinalTransactionStep: (flowStep: FlowStep) => void;
  }) {
    this.callFlowStep = options.callFlowStep
    this.validateFlowStep = options.validateFlowStep
    const glo = options.glo
    const rendering_flow = options.rendering_flow
    const iteration_time = options.iteration_time

    this.iteration_time = iteration_time || 250

    this.hndIterateCallbacksFlow = this.iterateCallbacksFlow.bind(this)

    const raf = rendering_flow && getBoxedRAFFunc(glo)
    if (raf) {
      this.pushIteration = raf
    } else {
      const setImmediate = getBoxedSetImmFunc(glo, options.onError)
      this.pushIteration = setImmediate
    }

    this.reportLongTask = options.reportLongTask || null
    this.reportHugeQueue = options.reportHugeQueue || null
    this.onFinalTransactionStep = options.onFinalTransactionStep
  }

  input(
    fn: Function,
    args: unknown[] | undefined,
    context: unknown | null,
  ): void {
    this.pushToFlow(fn, context, args)
  }
  whenReady(fn: Function): void {
    this.pushToFlow(fn, null, undefined, null, null, null, true)
  }
  iterateCallbacksFlow(): void {
    const started_at = Date.now()
    const start = started_at + this.iteration_time
    let last_call_at = started_at
    this.iteration_delayed_check_time = 0
    this.callbacks_busy = true

    let stopped
    for (let cur = this.flow_start; cur;) {
      this.flow_start = cur
      if (!this.flow_start) {
        this.flow_end = null
      }

      if (last_call_at > start) {
        stopped = cur
        this.pushIteration(this.hndIterateCallbacksFlow)
        break
      }

      this.flow_start = cur.next
      if (!this.flow_start) {
        this.flow_end = null
      }

      if (!cur.aborted) {
        this.current_step = cur
        cur.call()
        this.current_step = null
      }

      const completed_at = Date.now()

      if (this.reportLongTask != null) {
        this.reportLongTaskRaw(completed_at - last_call_at, cur)
      }

      last_call_at = completed_at


      const toClean = cur

      const next_step = this.flow_start == cur
        ? cur.next
        : this.flow_start

      if (next_step == null || cur.complex_order[0] != next_step.complex_order[0]) {
        this.handleFinalTrasactionEnd(cur)
      }

      cur = next_step

      // clean
      toClean.next = null
    }
    this.flow_start = stopped || null
    if (!stopped) {
      this.bad_stops_strike_counter = 0
      this.flow_end = null
    } else {
      this.bad_stops_strike_counter++

      if (this.bad_stops_strike_counter >= 5) {
        this.reportHugeQueueRaw(last_call_at - started_at, stopped)
        this.bad_stops_strike_counter = 0
      }
    }

    if (!this.flow_start) {
      this.callbacks_busy = false
    }

  }
  checkCallbacksFlow(): void {
    if (this.callbacks_busy) {
      return
    }

    const now = Math.round(Date.now())

    if (this.iteration_delayed_check_time) {
      if (this.iteration_delayed_check_time <= now) {

        // HELP GC
        this.flow_start = null
        this.flow_end = null
        throw new Error('browser did not executed queue callback fn')
      }
      return
    }

    this.pushIteration(this.hndIterateCallbacksFlow)
    this.iteration_delayed_check_time = now + MIN
  }
  pushToFlowWithMotivator(
    fn: Function,
    context: unknown | null,
    args: unknown[] | undefined,
    force?: boolean
  ): void {
    const motivator = this.current_step
    if (!motivator && force) {
      throw new Error('missing motivator')
    }
    this.pushToFlow(fn, context, args, null, null, motivator)
  }
  pushToFlow(
    fn: Function,
    context: unknown,
    args: unknown[] | undefined,
    cbf_arg?: null,
    cb_wrapper?: null | Function,
    motivator?: FlowStep | null,
    finup?: boolean,
    initiator?: unknown, // remove initiator argument as it's not used and throw an error for it
    init_end?: undefined // remove init_end argument as it's not used and throw an error for it
  ): FlowStep {
    const flow_step_num = ++this.flow_steps_counter

    const complex_order = complexOrder(motivator?.complex_order, flow_step_num)

    if (initiator) {
      throw new Error('use motivator, not initiator')
    }


    const is_transaction_end = motivator ? motivator.is_transaction_end : false
    const flow_step = new FlowStep(
      this.callFlowStep,
      is_transaction_end,
      flow_step_num,
      complex_order,
      fn,
      context,
      args,
      cbf_arg || null,
      cb_wrapper || null,
      finup,
      init_end
    )
    this.validateFlowStep(flow_step)
    orderFlow(this, flow_step)
    this.checkCallbacksFlow()
    return flow_step

  }
  scheduleTransactionEnd(
    starter_id: number,
    context: unknown,
    args: unknown[] | undefined,
    fn: Function,
    cb_wrapper: Function | undefined
  ): void {
    const flow_step_num = ++this.flow_steps_counter
    const complex_order = [starter_id, Infinity, flow_step_num]

    const is_transaction_end = true
    const flow_step = new FlowStep(
      this.callFlowStep,
      is_transaction_end,
      flow_step_num,
      complex_order,
      fn,
      context,
      args,
      null,
      cb_wrapper || null
    )
    this.validateFlowStep(flow_step)
    orderFlow(this, flow_step)
    this.checkCallbacksFlow()
  }
  handleFinalTrasactionEnd(step: FlowStep): void {
    this.onFinalTransactionStep(step)
  }
  reportLongTaskRaw(taskTime: number, task: FlowStep): void {
    if (taskTime < 500) {
      return
    }
    const reportLongTask = this.reportLongTask
    if (reportLongTask == null) {
      return
    }
    reportLongTask(task, taskTime)
  }
  reportHugeQueueRaw(duration: number, task: FlowStep): void {
    if (this.reportHugeQueue == null) {
      return
    }

    const reportHugeQueue = this.reportHugeQueue
    reportHugeQueue(task, duration)
  }
}

function complexOrder(order_list: readonly number[] | undefined, new_step_num: number): readonly number[] {
  if (!order_list) {
    return Object.freeze([new_step_num])

  }

  return Object.freeze([...order_list, new_step_num])
}

export default CallbacksFlow
