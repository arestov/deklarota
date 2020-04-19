define(function(require) {
'use strict'
var dom_helpers = require('../../utils/dom_helpers')
var PvSimpleSampler = require('../PvSimpleSampler');
var BnddChunk = require('../BnddChunk')
var checkPVRepeat = require('./checkPVRepeat')

var after = dom_helpers.after;
var detach = dom_helpers.detach;


return function(node, data) {
  if (node == this.root_node){
    return;
  }

  var
    expression = data.expression,
    valueIdent = data.valueIdent,
    keyIdent = data.keyIdent,
    calculator = data.calculator,
    sfy_values = data.sfy_values;

  var comment_anchor = window.document.createComment('pv-repeat anchor for: ' + expression);
  after(node, comment_anchor);

  detach(node)
  var repeat_data = {
    array: null
  };
  var nothing;

  return [
    new BnddChunk('pv_repeat', repeat_data),
    new BnddChunk('states_watcher', {
      w_cache_key:  node.pvprsd + '_' + node.pvprsd_inst + '*' + 'pv-repeat',
      node: node,
      context: this,
      original_fv: nothing,
      old_nodes: [],


      repeat_data: repeat_data,
      comment_anchor: comment_anchor,


      sampler: new PvSimpleSampler(node, this.struc_store, this.getSample),
      valueIdent: valueIdent,
      keyIdent: keyIdent,
      calculator: calculator,
      field_name: sfy_values[0],

      values: calculator.propsToWatch,
      sfy_values: sfy_values,
      checkFunc: checkPVRepeat
    })
  ];
}
})
