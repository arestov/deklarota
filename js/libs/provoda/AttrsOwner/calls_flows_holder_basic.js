import { WFlowStepWrapper } from '../flowStepsWrappers.type'
import subscribeToDie from '../internal_events/die/subscribe'

const assertCurm = (self) => {
  const curm = self._currentMotivator()
  if (!curm) {
    throw new Error('no curm')
  }
}

const calls_flows_holder_basic = {
  onDie: function(cb) {
    subscribeToDie(this, cb)
  },
  _getCallsFlow: function() {
    // disable this._local_calls_flow || for some time!
    return this._calls_flow
  },
  _currentMotivator: function() {
    return this._getCallsFlow().current_step
  },
  input: function(fn, args) {
    this._getCallsFlow().input(fn, args)
  },
  inputFn: function(fn) {
    const self = this
    return function() {
      const args = Array.prototype.slice.call(arguments)
      self._calls_flow.input(fn, args, self)
    }
  },
  nextLocalTick: function(fn, args, use_current_motivator, finup) {
    if (!use_current_motivator) {
      throw new Error('consider to use .input() or .inputWithContext()')
    }

    assertCurm(this)

    return this._getCallsFlow().pushToFlow(fn, this, args, false, WFlowStepWrapper, this, use_current_motivator && this._currentMotivator(), finup)
  },
  inputWithContext: function(fn, args) {
    this._getCallsFlow().input(fn, args, this)
  },
  nextTick: function(fn, args, use_current_motivator, initiator) {
    if (!use_current_motivator) {
      throw new Error('consider to use .input() or .inputWithContext()')
    }

    assertCurm(this)

    return this._calls_flow.pushToFlow(
      fn, this, args, !args && this, WFlowStepWrapper, this, use_current_motivator && this._currentMotivator(), false,
      initiator, fn.init_end
    )
  },
}

export default calls_flows_holder_basic
