define(function() {
'use strict'
var makePvWhen = require('../pv-when-condition/makeDirective.js')

return function(node, params, getSample, opts) {
  var parent_node = node.parentNode;
  var full_declaration = params;

  var comment_anchor = window.document.createComment('anchor for pv-when');
  parent_node.replaceChild(comment_anchor, node);
  var directives_data = {
    new_scope_generator: true,
    instructions: {
      'pv-when-condition': makePvWhen(comment_anchor, full_declaration, false, node)
    }
  };
  comment_anchor.directives_data = directives_data;
  return comment_anchor;
}
})
