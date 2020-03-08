define(function() {
'use strict';
var spv = require('spv');
var prefixValue = function(prefix) {
  if (!prefix) {
    return ''
  }

  return prefix + ':'
}

return function(name, Constr, prefix) {
  var Result = spv.inh(Constr, {
    skip_code_path: true
  }, {
    hierarchy_name: prefixValue(prefix) + name
  })
  return Result
}
})
