define(function() {
'use strict'
var makePvWhen = require('../pv-when-condition/makeDirective.js')

return function(node, params, getSample, opts) {
  params.done = true;
  var map = opts && opts.samples;

  var sample_name = (map && map[params.sample_name]) || params.sample_name;

  var parent_node = node.parentNode;
  if (!params['pv-when']) {
    var tnode = getSample(sample_name, true);
    parent_node.replaceChild(tnode, node);
    return tnode;
  } else {
    var comment_anchor = window.document.createComment('anchor for pv-when');
    parent_node.replaceChild(comment_anchor, node);
    var directives_data = {
      new_scope_generator: true,
      instructions: {
        'pv-when-condition': makePvWhen(comment_anchor, params['pv-when'], function() {
          return getSample(sample_name, true);
        }, null)
      }
    };
    comment_anchor.directives_data = directives_data;
    return comment_anchor;
  }
}
})
