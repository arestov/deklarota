define(function(require) {
'use strict';
var regxp_spaces = /\s+/gi;
var angbo = require('angbo');

return function(){
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
}
})
