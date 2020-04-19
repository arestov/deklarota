define(function(require) {
'use strict'
var spv = require('spv')
var dom_helpers = require('../utils/dom_helpers')

var detach = dom_helpers.detach;
var before = dom_helpers.before;

return function indexPvView(item, index) {
  var real_name = item.coll_name;
  var space = item.space || 'main';
  if (item.for_model){
    var field = [real_name, 'by_model_name', space];
    var storage = spv.getTargetField(index, field);
    if (!storage){
      storage = {index: {}};
      spv.setTargetField(index, field, storage);
    }
    if (storage.index[item.for_model]) {
      throw new Error("you can't have multiple `by_model` views");
      // not implemented yet. so don't use it;
    }

    item.comment_anchor = window.document.createComment(
      'collch anchor for: ' + real_name + ", " + item.for_model + ' (by_model_name)'
    );
    before(item.node, item.comment_anchor)

    //cur.sampler
    item.original_node = item.node;
    //cur.sampler =
    detach(item.node)

    storage.index[item.for_model] = item;
  } else {
    spv.setTargetField(index, [real_name, 'usual', space], item);

    //result[real_name][space] = cur;
  }
};

})
