define(function(require) {
'use strict'

var spv = require('spv');
var pvState = require('../utils/state');
var getTargetField = spv.getTargetField
var arrayExclude = spv.arrayExclude

var parent_count_regexp = /^\^+/gi;

return function(view, con) {
  if (!view._lbr.hndTriggerTPLevents) {
    view._lbr.hndTriggerTPLevents = function(e) {
      var cb_data = e.callback_data;

      for (var i = 0; i < cb_data.length; i++) {
        var cur = cb_data[i];
        if (typeof cur == 'function') {
          cb_data[i] = cur(e.scope || view.states);
        }
      }

      var isLocal = Boolean(cb_data[0]);
      var fnNameRaw = cb_data[0] || cb_data[1];
      var target_view;
      var fnName;

      var firstChar = fnNameRaw.charAt(0);

      if (firstChar === '#') {
        target_view = view.root_view;
        fnName = fnNameRaw.slice(1);
      } else if (firstChar === '^') {
        var fnName = fnNameRaw.replace(parent_count_regexp, '');
        var parent_count = fnNameRaw.length - fnName.length;
        target_view = view
        for (var i = 0; i < parent_count; i++) {
          target_view = target_view.parent_view;
        }
      } else {
        fnName = fnNameRaw
        target_view = view;
      }

      var args_list = cb_data.slice(isLocal ? 1 : 2).map(function (argumentRaw) {
        var argument;
        var stringed_variable = argumentRaw && argumentRaw.match(/\%(.*?)\%(.*)/);
        if (!stringed_variable || !stringed_variable[2]) {
          argument = argumentRaw;
        } else {
          var rest_part = stringed_variable[2];
          var inverted = rest_part.charAt(0) === '!'
          var path = inverted ? rest_part.slice(1) : rest_part
          switch (stringed_variable[1]) {
            case "node": {
              argument = getTargetField(e.node, path);
              break;
            }
            case "event": {
              argument = getTargetField(e.event, path);
              break;
            }
            case "attrs": {
              argument = pvState(view, path)
              break;
            }
            default: {
              console.warn('unknown event data source: ' + stringed_variable[1])
            }
          }
          argument = inverted ? (!argument) : argument
        }
        return argument;
      });

      if (!isLocal) {
        if (!args_list.length) {
          target_view.handleTemplateRPC.call(target_view, fnName);
          return;
        }

        target_view.handleTemplateRPC.apply(target_view, [fnName].concat(args_list));
        return;
      }

      if (!e.pv_repeat_context || args_list.length){
        target_view.tpl_events[fnName].apply(target_view, [e.event, e.node].concat(args_list));
      } else {
        target_view.tpl_r_events[e.pv_repeat_context][fnName].call(target_view, e.event, e.node, e.scope);
      }

    };
  }

  if (!view._lbr.hndPvTypeChange) {
    view._lbr.hndPvTypeChange = function(arr_arr) {
      //pvTypesChange
      //this == template
      //this != provoda.View
      var old_waypoints = this.waypoints;
      var total = [];
      var i = 0;
      for (i = 0; i < arr_arr.length; i++) {
        if (!arr_arr[i]) {
          continue;
        }
        total.push.apply(total, arr_arr[i]);
      }
      var matched = [];
      for (i = 0; i < total.length; i++) {
        var cur = total[i];
        if (!cur.marks){
          continue;
        }
        if (cur.marks['hard-way-point'] || cur.marks['way-point']){
          matched.push(cur);
        }
      }
      var to_remove = old_waypoints && arrayExclude(old_waypoints, matched);
      this.waypoints = matched;
      view.updateTemplatedWaypoints(matched, to_remove);
    };
  }

  if (!view._lbr.hndPvTreeChange) {
    view._lbr.hndPvTreeChange = function(current_motivator) {
      view.checkTplTreeChange(current_motivator);
    };
  }

  if (!view._lbr.anchorStateChange) {
    view._lbr.anchorStateChange = function(name, node) {
      view.useInterface('anchor-' + name, node)
    };
  }


  return view.getTemplate(
    con,
    view._lbr.hndTriggerTPLevents,
    view._lbr.hndPvTypeChange,
    view._lbr.hndPvTreeChange,
    view._lbr.anchorStateChange
  );
}
})
