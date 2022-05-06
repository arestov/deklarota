

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

export default Eventor
