define(function(require) {
'use strict';
var StandartChange = require('../StandartChange');

return function() {
  var getClassName = function(node, class_name) {
    return node.classList.contains(class_name);
  };
  var setClassName = function(node, new_value, old, wwtch) {
    var class_name = wwtch.data;
    if (new_value) {
      node.classList.add(class_name);
    } else {
      node.classList.remove(class_name);
    }

  };

  var exp = /\S+\s*\:\s*(\{\{.+?\}\}|\S+)/gi;
  var two_part = /(\S+)\s*\:\s*(?:\{\{(.+?)\}\}|(\S+))/;
  return function(node, full_declaration, directive_name) {
    var statements = full_declaration.match(exp);
    if (!statements.length) { return; }

    var result = [];
    for (var i = statements.length - 1; i >= 0; i--) {
      var parts = statements[i].match(two_part);
      var class_name = parts[1];
      var condition = parts[2] || parts[3];
      if (!class_name || !condition) {
        throw new Error('wrong statement: ' + statements[i]);
      }

      result.push(new StandartChange(node, {
        data: class_name,
        statement: condition,
        getValue: getClassName,
        setValue: setClassName,
        simplifyValue: Boolean
      }, class_name + '$' + directive_name));

    }

    return result;
  };
}
})
