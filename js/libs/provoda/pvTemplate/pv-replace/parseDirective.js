define(function(require) {
'use strict'
var regxp_props = require('../regxp_props')

var regxp_props_com_soft = regxp_props.regxp_props_com_soft
var regxp_props_spaces = regxp_props.regxp_props_spaces
var regxp_props_statement = regxp_props.regxp_props_statement


return function(node, full_declaration, directive_name, getSample) {
  var index = {};
  var complex_value = full_declaration;
  var complects = complex_value.match( regxp_props_com_soft );

  for (var i = 0; i < complects.length; i++) {
    complects[i] = complects[i].replace( regxp_props_spaces, '' );
    var splitter_index = complects[i].indexOf(':');

    var prop = complects[i].slice( 0, splitter_index );
    var statement = complects[i].slice( splitter_index + 1 ).replace( regxp_props_statement, '' );

    if (!prop || !statement){
      throw new Error('wrong declaration: ' + complex_value);
    }
    index[prop] = statement;
  }

  return index;
}
})
