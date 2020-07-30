define(function (require) {
'use strict';

var hndMotivationWrappper = require('../../helpers/hndMotivationWrappper')
var StatesLabour = require('../../StatesLabour');

var getAttrByName = require('./getAttrByName')

var stackStateFlowStep = function(flow_step, state_name) {
  if (!this.zdsv) {
    this.zdsv = new StatesLabour(!!this.full_comlxs_index, this._has_stchs);
    //debugger;
  }
  flow_step.p_space = 'stev';
  flow_step.p_index_key = state_name;
  this.zdsv.createFlowStepsArray('stev', state_name).push(flow_step);
};

var LightEvOpts = function(ev_name, cb, context) {
  this.ev_name = ev_name;
  this.cb = cb;
  this.context = context;
  Object.seal(this)
}

LightEvOpts.prototype = {
  wrapper: hndMotivationWrappper,
}

return {
  test: function(namespace) {
    return !!getAttrByName(namespace);
  },
  fn: function(namespace) {
    return this.state(getAttrByName(namespace));
  },
  getWrapper: function() {
    return hndMotivationWrappper;
  },
  getFSNamespace: function(namespace) {
    return getAttrByName(namespace);
  },
  handleFlowStep: stackStateFlowStep,
  createEventOpts: function(ev_name, cb, context) {
    return new LightEvOpts(ev_name, cb, context)
  }
}
})
