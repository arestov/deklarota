define(function(require) {
'use strict';
var BnddChunk = require('../BnddChunk')

return function(node, pv_events_data) {
  if (pv_events_data){

    if (!this.sendCallback){
      throw new Error('provide the events callback handler to the Template init func');
    }
    var result = [];

    for (var i = 0; i < pv_events_data.length; i++) {
      var evdata = pv_events_data[i];
      result.push(new BnddChunk('pv_event', {node: node, evdata: evdata}));
    }
    return result;
  }
}
})
