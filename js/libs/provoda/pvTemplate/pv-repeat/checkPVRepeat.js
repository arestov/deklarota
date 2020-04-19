define(function(require) {
'use strict'
var spv = require('spv')
var dom_helpers = require('../../utils/dom_helpers')
var PvTemplate = require('../PvTemplate')

var append = dom_helpers.append;
var after = dom_helpers.after;
var detach = dom_helpers.detach;

var appendSpace = function() {
  //fixme
  //$(target).append(document.createTextNode(' '));
};


var abortFlowStep = function(tpl, w_cache_key) {
  var flow_step = tpl.calls_flow_index[w_cache_key];
  if (flow_step) {
    tpl.calls_flow_index[w_cache_key] = null;
    flow_step.abort();
  }
};

var removeFlowStep = function(tpl, w_cache_key) {
  tpl.calls_flow_index[w_cache_key] = null;
};

var hndPVRepeat = function(new_fv, states) {
  var wwtch = this;
  removeFlowStep(wwtch.context, wwtch.w_cache_key);
  //var new_fv = spv.getTargetField(states, wwtch.field_name);


  if (wwtch.original_fv != new_fv){
    var context = wwtch.context;
    //var node = wwtch.node;
    var old_nodes = wwtch.old_nodes;
    var repeat_data = wwtch.repeat_data;
    var field_name = wwtch.field_name;
    var valueIdent = wwtch.valueIdent;
    var keyIdent = wwtch.keyIdent;
    var comment_anchor = wwtch.comment_anchor;
    var sampler = wwtch.sampler;
    /*var new_value = calculator(states);
    if (simplifyValue){
      new_value = simplifyValue.call(_this, new_value);
    }*/


    var repeats_array = [];
    repeat_data.array = [];
    context.pv_types_collecting = true;

    detach(old_nodes)
    old_nodes.length = 0;

    wwtch.original_fv = new_fv;
    var collection = wwtch.calculator(states);

    var prev_node;

    var full_pv_context = '';
    if (context.pv_repeat_context){
      full_pv_context = context.pv_repeat_context + '.$.';
    }
    full_pv_context += field_name;

    var fragt = window.document.createDocumentFragment();

    for (var i = 0; i < collection.length; i++) {
      var scope = {};
      scope[valueIdent] = collection[i];
      if (keyIdent) {scope[keyIdent] = i;}
      scope.$index = i;

      scope.$first = (i === 0);
      scope.$last = (i === (collection.length - 1));
      scope.$middle = !(scope.$first || scope.$last);

      var cur_node = sampler.getClone();
      var template = new PvTemplate({
        node: cur_node,
        pv_repeat_context: full_pv_context,
        scope: scope,
        callCallbacks: context.sendCallback,
        struc_store: context.struc_store,
        calls_flow: context.calls_flow
      });

      old_nodes.push(cur_node);
      append(fragt, cur_node);
      appendSpace(fragt);
      prev_node = cur_node;
      repeats_array.push(template);
      repeat_data.array.push(template);
    }
    after(comment_anchor, fragt);
    if (!context.pv_repeats) {
      context.pv_repeats = {};
    }
    context.pv_repeats[full_pv_context] = repeats_array;
    context.pv_types_collecting = false;
    context._pvTypesChange();

  //	setValue.call(_this, node, attr_obj, new_value, original_value);
  //	original_value = new_value;
  }
};


var checkPVRepeat = function(states, async_changes, current_motivator) {
  var wwtch = this;
  abortFlowStep(wwtch.context, wwtch.w_cache_key);
  var new_fv = spv.getTargetField(states, wwtch.field_name);



  if (wwtch.original_fv != new_fv) {
    if (async_changes) {

      var flow_step = wwtch.context.calls_flow.pushToFlow(hndPVRepeat, this, [new_fv, states], false, false, false, current_motivator);
      wwtch.context.calls_flow_index[wwtch.w_cache_key] = flow_step;
    } else {
      hndPVRepeat.call(this, new_fv, states);
    }
  }
};

return checkPVRepeat
})
