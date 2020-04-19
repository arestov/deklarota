define(function(require) {
'use strict'
var spv = require('spv')
var dom_helpers = require('../utils/dom_helpers')
var indexPvView = require('./indexPvView')

var wrap = dom_helpers.wrap;

var removePvView = function(item, index) {
  var real_name = item.coll_name;
  var space = item.space || 'main';
  if (item.for_model){
    var field = [real_name, 'by_model_name', space];
    var storage = spv.getTargetField(index, field);
    if (storage) {
      storage.index[item.for_model] = null;
    }
  } else {
    spv.setTargetField(index, [real_name, 'usual', space], null);

    //result[real_name][space] = cur;
  }
};

var handleChunks = (function() {
  var chunk_destroyers = {
    'states_watcher': function(chunk, tpl) {
      tpl.states_watchers = spv.findAndRemoveItem(tpl.states_watchers, chunk.data);
    },
    'ancs': function(chunk, tpl) {
      if (!tpl.ancs) {return;}
      var anchor_name = chunk.data.anchor_name;
      tpl.ancs[anchor_name] = null;
    },
    'pv_type': function(chunk, tpl) {
      if (!tpl.pv_types) {return;}
      tpl.pv_types = spv.findAndRemoveItem(tpl.pv_types, chunk.data);
    },
    'pv_event': function(chunk) {
      chunk.destroyer();
    },
    'pv_view': function(chunk, tpl) {
      if (!tpl.children_templates) {return;}
      removePvView(chunk.data, tpl.children_templates);
      if (chunk.data.destroyers) {
        while (chunk.data.destroyers.length) {
          var cur = chunk.data.destroyers.pop();
          cur();
        }
      }
    },
    'pv_repeat': function(chunk, tpl) {
      if (!tpl.pv_repeats_data) {return;}
      tpl.pv_repeats_data = spv.findAndRemoveItem(tpl.pv_repeats_data, chunk.data);
    }
  };
  var chunk_handlers = {
    'states_watcher': function(chunk, tpl) {
      tpl.states_watchers.push(chunk.data);
    },
    'ancs': function(chunk, tpl) {
      if (!tpl.ancs) {
        tpl.ancs = {};
      }
      var anchor_name = chunk.data.anchor_name;
      if (tpl.ancs[anchor_name]){
        throw new Error('anchors exists');
      } else {
        tpl.ancs[anchor_name] = wrap(chunk.data.node);
      }
    },
    'pv_type': function(chunk, tpl) {
      if (!tpl.pv_types) {
        tpl.pv_types = [];
      }
      tpl.pv_types.push(chunk.data);
    },
    'pv_event': function(chunk, tpl) {
      chunk.destroyer = tpl.bindPVEvent(chunk.data.node, chunk.data.evdata);
    },
    'pv_view': function(chunk, tpl) {
      if (!tpl.children_templates) {
        tpl.children_templates = {};
      }
      indexPvView(chunk.data, tpl.children_templates);
    },
    'pv_repeat': function(chunk, tpl) {
      if (!tpl.pv_repeats_data) {
        tpl.pv_repeats_data = [];
      }
      tpl.pv_repeats_data.push(chunk.data);
    }
  };

  return function handleChunks(items, tpl, need_clean) {
    if (!items) {return need_clean && [];}
    var result = need_clean && [];
    for (var i = 0; i < items.length; i++) {
      var chunk = items[i];
      if (!chunk.dead) {
        result.push(chunk);
      } else {
        var destroyer = chunk_destroyers[chunk.type];
        if (destroyer) {
          destroyer(chunk, tpl);
        }
      }
      if (!chunk.dead && !chunk.handled) {
        chunk.handled = true;
        chunk_handlers[chunk.type](chunk, tpl);
      }
    }
    return result;
  };
})();

return handleChunks
})
