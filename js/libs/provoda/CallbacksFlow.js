

import FlowStep from './FlowStep'
import orderFlow from './CallbacksFlow/order'
import { getBoxedSetImmFunc } from './CallbacksFlow/getBoxedSetImmFunc'
import { getBoxedRAFFunc } from './CallbacksFlow/getBoxedRAFFunc'

const MIN = 60 * 1000

const CallbacksFlow = function(options) {
  this.callFlowStep = options.callFlowStep
  // glo is global/window
  const glo = options.glo
  const rendering_flow = options.rendering_flow
  const iteration_time = options.iteration_time

  this.flow = []
  this.flow_start = null
  this.flow_end = null
  this.busy = false
  this.iteration_time = iteration_time || 250
  this.iteration_delayed_check_time = 0
  this.flow_steps_counter = 1
  this.bad_stops_strike_counter = 0

  // this.flow_steps_collating_invalidated = null;
  const _this = this
  this.hndIterateCallbacksFlow = function() {
    _this.iterateCallbacksFlow()
  }
  const raf = rendering_flow && getBoxedRAFFunc(glo)
  if (raf) {
    this.pushIteration = function(fn) {
      return raf(fn)
    }
  } else {
    const setImmediate = getBoxedSetImmFunc(glo, options.onError)
    this.pushIteration = function(fn) {
      return setImmediate(fn)
    }
  }

  this.reportLongTask = options.reportLongTask || null
  this.reportHugeQueue = options.reportHugeQueue || null

  this.onFinalTransactionStep = options.onFinalTransactionStep
}

CallbacksFlow.prototype = {
  input: function(fn, args, context) {
    this.pushToFlow(fn, context, args)
  },
  iterateCallbacksFlow: function() {
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
    this.flow_start = stopped
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

  },
  checkCallbacksFlow: function() {
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
  },
  pushToFlowWithMotivator: function(fn, context, args, force) {
    const motivator = this.current_step
    if (!motivator && force) {
      throw new Error('missing motivator')
    }
    this.pushToFlow(fn, context, args, null, null, null, motivator)
  },
  pushToFlow: function(fn, context, args, cbf_arg, cb_wrapper, real_context, motivator, finup, initiator, init_end) {
    const flow_step_num = ++this.flow_steps_counter

    const complex_order = complexOrder(motivator?.complex_order, flow_step_num)

    if (initiator) {
      throw new Error('use motivator, not initiator')
    }


    const is_transaction_end = motivator ? motivator.is_transaction_end : false
    const flow_step = new FlowStep(this.callFlowStep, is_transaction_end, flow_step_num, complex_order, fn, context, args, cbf_arg, cb_wrapper, real_context, finup, init_end)
    orderFlow(this, flow_step)
    this.checkCallbacksFlow()
    return flow_step

  },
  scheduleTransactionEnd: function functionName(starter_id, context, args, fn, cb_wrapper) {
    const flow_step_num = ++this.flow_steps_counter
    const complex_order = [starter_id, Infinity, flow_step_num]

    const is_transaction_end = true
    const flow_step = new FlowStep(this.callFlowStep, is_transaction_end, flow_step_num, complex_order, fn, context, args, null, cb_wrapper)
    orderFlow(this, flow_step)
    this.checkCallbacksFlow()
  },
  handleFinalTrasactionEnd: function(step) {
    this.onFinalTransactionStep(step)
  },
  reportLongTaskRaw: function(taskTime, task) {
    if (taskTime < 500) {
      return
    }
    const reportLongTask = this.reportLongTask
    reportLongTask(task, taskTime)
  },

  reportHugeQueueRaw: function(duration, task) {
    if (this.reportHugeQueue == null) {
      return
    }

    const reportHugeQueue = this.reportHugeQueue
    reportHugeQueue(task, duration)
  }
}

function complexOrder(order_list, new_step_num) {
  if (!order_list) {
    return Object.freeze([new_step_num])

  }

  return Object.freeze([...order_list, new_step_num])
}

export default CallbacksFlow
