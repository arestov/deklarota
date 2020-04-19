define(function(require) {
'use strict'
var StandartChange = require('../StandartChange');
var PvSimpleSampler = require('../PvSimpleSampler');
var dom_helpers = require('../../utils/dom_helpers')

var dRemove = dom_helpers.remove
var dAfter = dom_helpers.after

return function makePvWhen(anchor, expression, getSample, sample_node) {
  // debugger;
  return new StandartChange(anchor, {
    data: {
      sample_node: sample_node,
      getSample: getSample
    },
    simplifyValue: function(value) {
      return !!value;
    },
    statement: expression,
    getValue: function(node, data) {
      return node.pvwhen_content;
      // debugger
    },
    setValue: function(node, new_value, old_value, wwtch) {
      if (new_value && !node.pvwhen_content) {
        node.pvwhen_content = true;
        var root_node;
        var tpl  = wwtch.context;
        if (wwtch.data.getSample) {
          root_node = wwtch.data.getSample();
        } else {
          if (!wwtch.data.sampler) {
            wwtch.data.sampler = new PvSimpleSampler(wwtch.data.sample_node, tpl.struc_store, tpl.getSample);
          }
          root_node = wwtch.data.sampler.getClone();
        }

        wwtch.root_node = root_node;

        dAfter(node, root_node);
        var all_chunks = wwtch.context.parseAppended(root_node);

        wwtch.destroyer = function() {
          node.pvwhen_content = false;
          dRemove(wwtch.root_node);
          for (var i = 0; i < all_chunks.length; i++) {
            all_chunks[i].dead = true;
          }
          wwtch.context.checkChunks();
        };

        wwtch.context.pvTreeChange(this.current_motivator);

        // debugger
      } else if (!new_value && node.pvwhen_content) {
        wwtch.destroyer();
      }
      //	this.setValue(wwtch.node, new_value, old_value, wwtch);

    }
  }, 'pv-when');
}
})
