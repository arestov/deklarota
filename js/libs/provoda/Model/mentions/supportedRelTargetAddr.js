define(function() {
'use strict'
var supportedRelTargetAddr = function(addr) {
  if (addr.base_itself) {
    return false
  }

  if ((addr.resource && addr.resource.path) || addr.from_base.type) {
    return false
  }

  return addr.result_type == "nesting" || addr.nesting.path
}

return supportedRelTargetAddr
})
