define(function(require) {
'use strict';

var spv = require('spv');
var angbo = require('angbo');
var StandartChange = require('./StandartChange');
var parsePvWhen= require('./pv-when/parseDirective')
var parsePvReplace = require('./pv-replace/parseDirective')
var parsePvText = require('./pv-text/parseDirective')
var parsePvClass = require('./pv-class/parseDirective')
var parsePvProps = require('./pv-props/parseDirective')

var startsWith = spv.startsWith;

var regxp_complex_spaces = /(^\s+)|(\s+$)|(\s{2,})/gi;
var regxp_spaces = /\s+/gi;


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
    'pv-type': (function() {
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
    })(),
    'pv-events': (function(){
        var createPVEventData = function(event_name, data, event_opts) {

        event_opts = event_opts && event_opts.split(',');
        var event_handling = {};
        if (event_opts){
          for (var i = 0; i < event_opts.length; i++) {
            event_handling[event_opts[i]] = true;
          }
        }


        return {
          event_name: event_name,
          fn: function(e, context) {
            if (event_handling.sp){
              e.stopPropagation();
            }
            if (event_handling.pd){
              e.preventDefault();
            }
            context.callEventCallback(this, e, data.slice());
          }
        };
      };


      var createEventParams = function(array) {
        for (var i = 0; i < array.length; i++) {
          var cur = array[i];
          if (cur.indexOf('{{') != -1) {
            array[i] = angbo.interpolateExpressions( cur );
          }
        }
        return array;
      };

      return function(node, full_declaration) {
        /*
        click:Callback
        mousemove|sp,pd:MovePoints
        */
        var result = [];
        var declarations = full_declaration.split(regxp_spaces);
        for (var i = 0; i < declarations.length; i++) {
          var cur = declarations[i].split(':');
          var dom_event = cur.shift();
          var decr_parts =  dom_event.split('|');



          result.push(createPVEventData(decr_parts[0], createEventParams(cur), decr_parts[1]));
        }
        return result;
      };
    })()
  },
  scope_generators_p: {
    'pv-nest': function(node, full_declaration) {
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
    },
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

});
