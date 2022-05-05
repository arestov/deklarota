import { WFlowStepWrapper } from '../../../flowStepsWrappers.type'
import getValueByName from './getValueByName'

const LightEvOpts = function(ev_name, cb, context) {
  this.ev_name = ev_name
  this.cb = cb
  this.context = context
  Object.freeze(this)
}

LightEvOpts.prototype = {
  wrapper: WFlowStepWrapper,
}

export default {
  test: function(namespace) {
    return !!getValueByName(namespace)
  },
  fn: function() {
    return null
  },
  getWrapper: function() {
    return WFlowStepWrapper
  },
  getFSNamespace: function(namespace) {
    return getValueByName(namespace)
  },
  createEventOpts: function(ev_name, cb, context) {
    return new LightEvOpts(ev_name, cb, context)
  }
}
