define(function() {
'use strict'
var empty = ''
var isMeaningfulValue = function(value) {
  // https://twitter.com/jonathoda/status/960952613507231744
  // https://twitter.com/jonathoda/status/1138881930399703041
  return value != null && value !== empty
}
return isMeaningfulValue
})
