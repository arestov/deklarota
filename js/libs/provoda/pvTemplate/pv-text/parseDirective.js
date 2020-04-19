define(function(require) {
'use strict'
var StandartChange = require('../StandartChange');
var dom_helpers = require('../../utils/dom_helpers')

var getText = dom_helpers.getText;
var setText = dom_helpers.setText;

return function() {
  var getTextValue = function(node) {
    return getText(node);
  };
  var setTextValue = function(node, new_value) {
    return setText(node, new_value)
  };
  return function(node, full_declaration, directive_name) {
    return new StandartChange(node, {
      complex_statement: full_declaration,
      getValue: getTextValue,
      setValue: setTextValue
    }, directive_name);
  };
}
})
