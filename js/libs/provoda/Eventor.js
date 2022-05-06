

import spv from '../spv'
import FastEventor from './FastEventor/index'
import { WFlowStepWrapper } from './flowStepsWrappers.type'
import onInstanceInitDie from './internal_events/die/onInstanceInit'
import subscribeToDie from './internal_events/die/subscribe'

const assertCurm = (self) => {
  const curm = self._currentMotivator()
  if (!curm) {
    throw new Error('no curm')
  }
}

const flows = {
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
      self._calls_flow.pushToFlow(fn, self, args)
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

const Eventor = spv.inh(function() {}, {
  naming: function(construct) {
    return function Eventor() {
      construct(this)
    }
  },
  init: function(self) {
    onInstanceInitDie(self)
    self.evcompanion = new FastEventor(self)
  },
  props: {
    // init: function(){
    // 	this.evcompanion = new FastEventor(this);
    // 	return this;
    // },

    ...flows,
    off: function(namespace, cb, obj, context) {
      return this.evcompanion.off(namespace, cb, obj, context)
    },
  }
})


const PublicEventor = spv.inh(Eventor, {
  init: function(self, opts) {
    if (!opts || !opts._highway) {
      throw new Error('pass _highway option')
    }
    self._highway = opts._highway
    self._calls_flow = self._highway.calls_flow
  }
})

Eventor.PublicEventor = PublicEventor

export default Eventor
