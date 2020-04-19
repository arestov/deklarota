define(function(require) {
'use strict';
var BnddChunk = require('../BnddChunk')

return function(node, standch) {
  if (standch){
    var pv_type_data = {node: node, marks: null};

    var wwtch = standch.createBinding(node, this);
    wwtch.pv_type_data = pv_type_data;
    wwtch.checkFunc(this.empty_state_obj);

    return [
      new BnddChunk('states_watcher', wwtch),
      new BnddChunk('pv_type', pv_type_data)
    ];

  }
}
})
