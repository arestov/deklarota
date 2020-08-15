define(function(require) {
'use strict'
var mark = require('./mark')
var spv = require('spv')

return function prepare(root) {
  var augmented = spv.inh(root, {}, {})
  return mark(augmented, augmented, null)
}

})
