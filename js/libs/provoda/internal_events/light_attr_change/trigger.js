define(function(require) {
'use strict'

var utils_simple = require('../../utils/simple')

var getNameByAttr = require('./getNameByAttr')
//var st_event_name_default = ;
//var st_event_name_light = 'lgh_sch-';

function triggerLightAttrChange(self, attr_name, value, zdsv) {

  zdsv.abortFlowSteps('stev', attr_name);


  var light_name = getNameByAttr( attr_name );

  var light_cb_cs = self.evcompanion.getMatchedCallbacks(light_name);

  if (!light_cb_cs.length) {
    return;
  }

  var flow_steps = zdsv.createFlowStepsArray('stev', attr_name);

  self.evcompanion.triggerCallbacks(light_cb_cs, false, false, light_name, value, flow_steps);

  if (flow_steps) {
    utils_simple.markFlowSteps(flow_steps, 'stev', attr_name);
  }
}


return triggerLightAttrChange
})
