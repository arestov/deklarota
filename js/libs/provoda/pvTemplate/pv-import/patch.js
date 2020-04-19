define(function() {
'use strict'
var getTemplateOptions = require('./getTemplateOptions');

return function() {
  var counter = 1;

  function createKey() {
    return counter++;
  }

  return function(node, params, getSample, opts) {
    var template_options = getTemplateOptions(params, createKey);
    var instance = getSample(params.sample_name, true, template_options);

    var parent_node = node.parentNode;
    parent_node.replaceChild(instance, node);

    return instance;
  };
}
})
