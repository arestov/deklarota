define(function(require) {
'use strict'
var BnddChunk = require('../BnddChunk')

return function(node, standch) {
  if (standch) {
    var wwtch = standch.createBinding(node, this);
    var destroyer = function() {
      if (wwtch.destroyer) {
        wwtch.destroyer();
      }
    };
    var chunk = new BnddChunk('states_watcher', wwtch);
    chunk.destroyer = destroyer;
    return chunk;
  }

}
})
