

import spv from '../spv'
import FastEventor from './FastEventor/index'

const Eventor = spv.inh(function() {}, {
  naming: function(construct) {
    return function Eventor() {
      construct(this)
    }
  },
  init: function(self) {
    self.evcompanion = new FastEventor(self)
  },
  props: {
    // init: function(){
    // 	this.evcompanion = new FastEventor(this);
    // 	return this;
    // },

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
