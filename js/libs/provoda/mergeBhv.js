define(function(require) {
'use strict';
var spv = require('spv');
var cloneObj = spv.cloneObj;
return function mergeBhv(target, source) {
  var originalExtStates = target['attrs'];
  var copy = spv.cloneObj(target, source);

  if (originalExtStates && source['attrs']) {
    var newStates = cloneObj({}, originalExtStates);
    newStates = cloneObj(newStates, source['attrs']);
    copy['attrs'] = newStates;
  }

  return copy;
}

});
