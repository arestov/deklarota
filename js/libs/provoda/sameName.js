define(function(require) {
'use strict';
var spv = require('spv')
var memorize = spv.memorize

return memorize(function sameName(str) {
  // just store same string
  return str
})
})
