define(function(require) {
'use strict';
var angbo = require('angbo');
var StandartChange = require('../StandartChange');
var getFieldsTreesBases = StandartChange.getFieldsTreesBases;

return function(node, full_declaration) {

  //start of angular.js code
  var expression = full_declaration;//attr.ngRepeat;
  var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/),
    lhs, rhs, valueIdent, keyIdent;
  if (! match) {
    throw new Error("Expected ngRepeat in form of '_item_ in _collection_' but got '" +
    expression + "'.");
  }
  lhs = match[1];
  rhs = match[2];
  match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
  if (!match) {
    throw new Error("'item' in 'item in collection' should be identifier or (key, value) but got '" +
    lhs + "'.");
  }
  valueIdent = match[3] || match[1];
  keyIdent = match[2];
  //end of angular.js code

  var calculator = angbo.parseExpression(rhs);
  var all_values = calculator.propsToWatch;
  var sfy_values = getFieldsTreesBases(all_values);

  return {
    expression: expression,
    valueIdent: valueIdent,
    keyIdent: keyIdent,
    calculator: calculator,
    sfy_values: sfy_values
  };
}
})
