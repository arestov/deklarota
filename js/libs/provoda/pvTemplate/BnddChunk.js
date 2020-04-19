define(function() {
'use strict'

var BnddChunk = function(type, data) {
  this.type = type;
  this.data = data;
  this.dead = false;
  this.handled = false;
  this.states_inited = false;
  this.destroyer = null;
};

return BnddChunk
})
