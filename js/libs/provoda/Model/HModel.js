
import spv from '../../spv'
import Model from '../Model'

const HModel = spv.inh(Model, {
  strict: true,
  naming: function(fn) {
    return function HModel(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },
  preinit: function(self, opts) {
    if (!self.skip_map_init && !self.zero_map_level) {
      if (!opts || !opts.map_parent) {
        if (!self.zero_map_level) {
          throw new Error('who is your map parent model?')
        }
      }
    }



    // self._super.apply(this, arguments);
  },
}, {
  handling_v2_init: true,
})

export default HModel
