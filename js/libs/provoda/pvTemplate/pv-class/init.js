define(function(require) {
'use strict';
var BnddChunk = require('../BnddChunk')

return function(node, standches) {
  if (standches){
    var result = [];
    for (var i = 0; i < standches.length; i++) {
      var wwtch = standches[i].createBinding(node, this);
      result.push(new BnddChunk('states_watcher', wwtch));
    }
    return result;
  }
}
})
