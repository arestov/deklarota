define(function(require) {
'use strict'
var BnddChunk = require('../BnddChunk')

return function(node, standch){
  if (standch){
    var wwtch = standch.createBinding(node, this);
    return new BnddChunk('states_watcher', wwtch);
  }
}
})
