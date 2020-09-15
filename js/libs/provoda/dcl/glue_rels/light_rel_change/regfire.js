import hndMotivationWrappper from '../../../helpers/hndMotivationWrappper'
import getValueByName from './getValueByName'

var LightEvOpts = function(ev_name, cb, context) {
  this.ev_name = ev_name
  this.cb = cb
  this.context = context
  Object.freeze(this)
}

LightEvOpts.prototype = {
  wrapper: hndMotivationWrappper,
}

export default {
  test: function(namespace) {
    return !!getValueByName(namespace)
  },
  fn: function() {
    return null
  },
  getWrapper: function() {
    return hndMotivationWrappper
  },
  getFSNamespace: function(namespace) {
    return getValueByName(namespace)
  },
  createEventOpts: function(ev_name, cb, context) {
    return new LightEvOpts(ev_name, cb, context)
  }
}
