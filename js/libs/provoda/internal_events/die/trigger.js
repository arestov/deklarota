define(function() {
'use strict'

var emergency_opt = {
  emergency: true
};

return function(md) {
  var array = md.evcompanion.getMatchedCallbacks('die');
  if (!array.length) {
    return
  }

  md.evcompanion.triggerCallbacks(array, false, emergency_opt, 'die');

}

})
