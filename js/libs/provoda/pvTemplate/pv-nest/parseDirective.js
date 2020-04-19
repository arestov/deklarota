define(function(require) {
'use strict';
var angbo = require('angbo');
var spv = require('spv');
var startsWith = spv.startsWith;

return function(node, full_declaration) {
  var attr_value = full_declaration;

  var filter_parts = attr_value.split('|');

  var filterFn;
  if (filter_parts[1]){
    var calculator = angbo.parseExpression('obj |' + filter_parts[1]);
    filterFn = function(array) {
      return calculator({obj: array});
    };
  }

  var parts = filter_parts[0].split(/\s+/gi);
  var for_model,
    coll_name,
    controller_name,
    space;

  for (var i = 0; i < parts.length; i++) {

    var cur_part = parts[i];
    if (!cur_part){
      continue;
    }

    if (startsWith(cur_part, 'for_model:')){
      for_model = cur_part.slice('for_model:'.length);
    } else if (startsWith(cur_part, 'controller:')) {
      controller_name = cur_part.slice('controller:'.length);
    } else {
      var space_parts = cur_part.split(':');
      if (!coll_name){
        coll_name = space_parts[0];
      }
      if (!space){
        space = space_parts[1] || '';
      }
    }

  }

  return {
    coll_name: coll_name,
    for_model: for_model,
    controller_name: controller_name,
    space: space,
    filterFn: filterFn
  };
}
})
