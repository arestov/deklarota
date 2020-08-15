define(function(require) {
'use strict'
var spv = require('spv')

var spec_chars = { '^': true, '@': true, '#': true, '<': true }
var isSpecialState = spv.memorize(function(state_name) {
  var char = state_name.charAt(0)
  if (char === '&') {
    throw new Error('require marks should not be passed here. cut it earlier')
  }
  return spec_chars[state_name.charAt(0)]
})

return isSpecialState
})
