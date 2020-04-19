define(function(require) {
'use strict';

var angbo = require('angbo');
var StandartChange = require('./StandartChange');
var parsePvWhen= require('./pv-when/parseDirective')
var parsePvReplace = require('./pv-replace/parseDirective')
var parsePvText = require('./pv-text/parseDirective')
var parsePvClass = require('./pv-class/parseDirective')
var parsePvProps = require('./pv-props/parseDirective')
var parsePvType = require('./pv-type/parseDirective')
var parsePvEvents = require('./pv-events/parseDirective')
var parsePvNest = require('./pv-nest/parseDirective')

var getFieldsTreesBases = StandartChange.getFieldsTreesBases;

var getIndexList = function(obj, arr) {
  var result = arr || [];
  for (var prop in obj) {
    result.push( prop );
  }
  return result;
};

return {
  config: (function(){
    var config = {
      one_parse: {
        'pv-import': true,
        'pv-when': true
      },
      one_parse_list: [],
      pseudo: {
        'pv-when-condition': true
      },
      pseudo_list: [],
      scope_generators: {
        'pv-nest': true,
        'pv-repeat': true,
        'pv-foreign': true
      },
      scope_g_list: [],
      states_using_directives: {
        'pv-text': true,
        'pv-class': true,
        'pv-props': true,
        'pv-type': true,
        'pv-repeat': true
      },
      sud_list: [],
      directives: {
        'pv-text': true,
        'pv-class': true,
        'pv-props': true,
        'pv-anchor': true,
        'pv-type': true,
        'pv-events': true
      },
      directives_names_list: [],

      comment_directives: {
      //	'pv-when': true,
        'pv-replace': true,
        'pv-importable': true
      },
      comment_directives_names_list: [],
    };

    getIndexList(config.directives, config.directives_names_list);
    //порядок директив важен, по идее
    //должен в результате быть таким каким он задекларирован

    getIndexList(config.scope_generators, config.scope_g_list);
    //порядок директив важен, по идее
    //должен в результате быть таким каким он задекларирован

    getIndexList(config.states_using_directives, config.sud_list);

    getIndexList(config.comment_directives, config.comment_directives_names_list);

    getIndexList(config.one_parse, config.one_parse_list);
    getIndexList(config.pseudo, config.pseudo_list);

    return config;
  })(),
  getIndexList: getIndexList,
  getFieldsTreesBases: getFieldsTreesBases,
  comment_directives_p: {
    'pv-replace': parsePvReplace,
  },
  directives_p: {
    'pv-text': parsePvText,
    'pv-class': parsePvClass,
    'pv-props': parsePvProps,
    'pv-when': parsePvWhen,
    'pv-type': parsePvType,
    'pv-events': parsePvEvents,
  },
  scope_generators_p: {
    'pv-nest': parsePvNest,
    'pv-repeat': function(node, full_declaration) {

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
  }
};



});
