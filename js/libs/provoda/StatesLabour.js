

import spv from '../spv'

var StatesLabour = function() {
  this.flow_steps_stev = null
  this.flow_steps_vip_stdch_ev = null
  this.flow_steps_collch = null
  this.flow_steps_stch = null

  this.total_original_states = new Map()
  Object.seal(this)

}
StatesLabour.prototype.abortFlowSteps = function(space, index_key, is_one_item) {
  var full_space = 'flow_steps_' + space

  if (!this[full_space]) {
    return
  }

  var array = this[full_space][index_key]
  if (!array) {
    return
  }
  if (!is_one_item) {
    for (var i = 0; i < array.length; i++) {
      array[i].abort()
      array[i] = null
    }
    array.length = 0
  } else {
    array.abort()
    this[full_space][index_key] = null
  }

  return
}
StatesLabour.prototype.createFlowStepsArray = function(space, index_key, one_item) {
  var full_space = 'flow_steps_' + space
  if (!this[full_space]) {
    this[full_space] = {}
  }
  if (one_item) {
    this[full_space][index_key] = one_item
  } else if (!this[full_space][index_key]) {
    this[full_space][index_key] = []
  }

  return this[full_space][index_key]
}

StatesLabour.prototype.removeFlowStep = function(space, index_key, item) {
  var full_space = 'flow_steps_' + space
  var target = this[full_space][index_key]
/*	if (!target) {
    debugger;
    return;
  }*/
  if (Array.isArray(target)) {
    spv.findAndRemoveItem(target, item)
    //var pos = target.indexOf(item);
    //target.splice(pos, 1);


  } else {
    if (target == item) {
      this[full_space][index_key] = null
    } else {
      console.log('wrong motivator !?')
    }
  }


}
export default StatesLabour
