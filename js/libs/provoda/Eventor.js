

import spv from '../spv'
import FastEventor from './FastEventor/index'
import hndMotivationWrappper from './helpers/hndMotivationWrappper'
import onInstanceInitDie from './internal_events/die/onInstanceInit'
import subscribeToDie from './internal_events/die/subscribe'


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
    onDie: function(cb) {
      subscribeToDie(this, cb)
    },
    // init: function(){
    // 	this.evcompanion = new FastEventor(this);
    // 	return this;
    // },
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
    useMotivator: function(item, fn) {
      const old_value = item.current_motivator
      const motivator = this.current_motivator
      item.current_motivator = motivator
      const result = fn.call(this, item)
      item.current_motivator = old_value
      return result
    },
    nextLocalTick: function(fn, args, use_current_motivator, finup) {
      return this._getCallsFlow().pushToFlow(fn, this, args, false, hndMotivationWrappper, this, use_current_motivator && this._currentMotivator(), finup)
    },
    nextTick: function(fn, args, use_current_motivator, initiator) {
      return this._calls_flow.pushToFlow(
        fn, this, args, !args && this, hndMotivationWrappper, this, use_current_motivator && this._currentMotivator(), false,
        initiator, fn.init_end
      )
    },
    once: function(namespace, cb, opts, context) {
      return this.evcompanion.once(namespace, cb, opts, context)
    },
    on: function(namespace, cb, opts, context) {
      return this.evcompanion.on(namespace, cb, opts, context)
    },
    off: function(namespace, cb, obj, context) {
      return this.evcompanion.off(namespace, cb, obj, context)
    },
    trigger: function() {
      this.evcompanion.trigger.apply(this.evcompanion, arguments)
    },

    requestState: function() {
      return this.evcompanion.requestState.apply(this.evcompanion, arguments)
    },
    resetRequestedState: function() {
      return this.evcompanion.resetRequestedState.apply(this.evcompanion, arguments)
    },
    requestNesting: function() {
      return this.evcompanion.requestNesting.apply(this.evcompanion, arguments)
    }
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
