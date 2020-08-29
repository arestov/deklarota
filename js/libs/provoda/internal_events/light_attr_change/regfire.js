

import hndMotivationWrappper from '../../helpers/hndMotivationWrappper'
import getAttrByName from './getAttrByName'

var LightEvOpts = function(ev_name, cb, context) {
  this.ev_name = ev_name
  this.cb = cb
  this.context = context
  Object.seal(this)
}

LightEvOpts.prototype = {
  wrapper: hndMotivationWrappper,
}

export default {
  test: function(namespace) {
    return !!getAttrByName(namespace)
  },
  fn: function(namespace) {
    return this.state(getAttrByName(namespace))
  },
  getWrapper: function() {
    return hndMotivationWrappper
  },
  getFSNamespace: function(namespace) {
    return getAttrByName(namespace)
  },
  createEventOpts: function(ev_name, cb, context) {
    return new LightEvOpts(ev_name, cb, context)
  }
}
