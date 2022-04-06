
import spv from '../../spv'
import Model from '../Model'

const HModel = spv.inh(Model, {
  strict: true,
  naming: function(fn) {
    return function HModel(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },
  preinit: function(_self, _opts) {
  },
}, {
  handling_v2_init: true,
})

export default HModel
