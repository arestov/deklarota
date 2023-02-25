

import { WFlowStepWrapper } from '../../flowStepsWrappers.type'
import getAttrByName from './getAttrByName'

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
    return !!getAttrByName(namespace)
  },
  fn: function(namespace) {
    return this.state(getAttrByName(namespace))
  },
  getWrapper: function() {
    return WFlowStepWrapper
  },
  createEventOpts: function(ev_name, cb, context) {
    return new LightEvOpts(ev_name, cb, context)
  }
}
