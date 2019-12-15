define(function() {
'use strict'
var looksLikeWrappedJSON = function(string) {
  if (typeof string != 'string') {
    return false
  }

  return string.startsWith('"') && string.endsWith('"')
}

return looksLikeWrappedJSON
})
