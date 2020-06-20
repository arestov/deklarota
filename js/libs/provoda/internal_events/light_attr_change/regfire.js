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
  handleFlowStep: stackStateFlowStep
}
})
