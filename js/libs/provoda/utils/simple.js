
var getSTEVNameLight = require('../internal_events/light_attr_change/getNameByAttr')

export default {
  getSTEVNameLight: getSTEVNameLight,
  wipeObj: function(obj) {
    if (obj == null) {
      return obj
    }

    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        delete obj[p]
      }
    }

    return obj
  },
  nullObjValues: function(obj) {
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        obj[p] = null
      }
    }
  },
  markFlowSteps: function(flow_steps, p_space, p_index_key) {
    for (var i = 0; i < flow_steps.length; i++) {
      flow_steps[i].p_space = p_space
      flow_steps[i].p_index_key = p_index_key
    }
  }
}
