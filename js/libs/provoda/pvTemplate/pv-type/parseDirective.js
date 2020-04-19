define(function(require) {
'use strict';
var StandartChange = require('../StandartChange');

var regxp_spaces = /\s+/gi;

var regxp_complex_spaces = /(^\s+)|(\s+$)|(\s{2,})/gi;


function hlpFixStringSpaces(str, p1, p2, p3) {
  if (p1 || p2){
    return '';
  }
  if (p3){
    return ' ';
  }
  return '';
  //console.log(arguments);
}

function hlpSimplifyValue(value) {
  //this is optimization!
  if (!value){
    return value;
  }
  return value.replace(regxp_complex_spaces, hlpFixStringSpaces);
  // regxp_edge_spaces: /^\s+|\s+$/gi,
  //return value.replace(regxp_spaces,' ').replace(regxp_edge_spaces,'');
}

return function() {
  var getPVTypes = function() {
    return '';
  };

  var setPVTypes = function(node, new_value, ov, wwtch){
    var types = new_value.split(regxp_spaces);
    wwtch.pv_type_data.marks = {};
    for (var i = 0; i < types.length; i++) {
      if (types[i]){
        wwtch.pv_type_data.marks[types[i]] = true;
      }
    }

    wwtch.context._pvTypesChange();
  };

  return function(node, full_declaration, directive_name) {
    if (!full_declaration){
      return;
    }
    full_declaration = hlpSimplifyValue(full_declaration);

    //если pv-types не требует постоянных вычислений (не зависит ни от одного из состояний)
    //то использующие шаблон ноды могут выдавать общий результирующий объект - это нужно реализовать fixme

    return new StandartChange(node, {
      complex_statement: full_declaration,
      getValue: getPVTypes,
      setValue: setPVTypes,
      simplifyValue: hlpSimplifyValue
    }, directive_name);
  };
}
})
