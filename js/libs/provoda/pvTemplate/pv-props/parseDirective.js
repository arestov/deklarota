define(function(require) {
'use strict';
var spv = require('spv');
var regxp_props = require('../regxp_props')
var StandartChange = require('../StandartChange');

var capitalize = spv.capitalize;
var getTargetField = spv.getTargetField;
var setTargetField = spv.setTargetField;

var regxp_props_com = regxp_props.regxp_props_com
var regxp_props_spaces = regxp_props.regxp_props_spaces
var regxp_props_coms_part = regxp_props.regxp_props_coms_part
var regxp_props_statement = regxp_props.regxp_props_statement


var DOT = '.';


var convertFieldname = function(prop_name) {
  var parts = prop_name.replace(/^-/, '').split('-');
  if (parts.length > 1){
    for (var i = 1; i < parts.length; i++) {
      parts[i] = capitalize(parts[i]);
    }
  }
  return parts.join('');
};
var createPropChange = (function() {
  var getValue = function(node, prop) {
    return getTargetField(node, prop);
  };
  var setValue = function(node, value, old_value, wwtch) {
    var prop = wwtch.data;
    var new_value = value || '';

    if (!wwtch.standch.needs_recheck) {
      return setTargetField(node, prop, new_value);
    }

    var current_value = getTargetField(node, prop);
    if (current_value == new_value) {
      return;
    }

    return setTargetField(node, prop, value || '');
  };

  return function(node, prop, statement, directive_name) {
    var parts = prop.split(DOT);
    for (var i = 0; i < parts.length; i++) {
      parts[i] = convertFieldname(parts[i]);
    }
    prop = parts.join(DOT);

    var needs_recheck = prop == 'value'
    // we should avoid reading dom. it could be perfomance problem, but
    // we don't want to rewrite value for input since it will break cursor position
    // p.s. we could add more clever check for noteName === 'textarea' and other attrs
    // TODO: check if this realy needed

    return new StandartChange(node, {
      data: prop,
      needs_recheck: needs_recheck,
      statement: statement,
      getValue: getValue,
      setValue: setValue
    }, directive_name);
  };
})();

return function(node, full_declaration, directive_name) {
  var result = [];
  var complex_value = full_declaration;
  var complects = complex_value.match(regxp_props_com);
  for (var i = 0; i < complects.length; i++) {
    complects[i] = complects[i].replace(regxp_props_spaces,'').split(regxp_props_coms_part);
    var prop = complects[i][0];
    var statement = complects[i][1] && complects[i][1].replace(regxp_props_statement,'');

    if (!prop || !statement){
      throw new Error('wrong declaration: ' + complex_value);
      //return;
    }
    var item = createPropChange(node, prop, statement, prop + '$' + directive_name);
    if (item){
      result.push(item);
    }

  }
  return result;
  //пример:
  //"style.width: {{play_progress}} title: {{full_name}} style.background-image: {{album_cover_url}}"
}
})
