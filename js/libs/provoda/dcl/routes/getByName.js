define(function(require) {
'use strict'
var spv = require('spv')
var cloneObj = spv.cloneObj

return function(self, sp_name) {
  if (self.__routes_matchers_defs == null) {
    return null
  }

  if (self.__modern_subpages_valid) {
    return self.__modern_subpages[sp_name]
  }

  self.__modern_subpages_valid = true

  var result = {}

  for (var i = self.__routes_matchers_runs.length - 1; i >= 0; i--) {
    var cur = self.__routes_matchers_runs[i]
    if (!cur.matched) {
      continue
    }

    cloneObj(result, cur.matched)
  }

  self.__modern_subpages = result

  return self.__modern_subpages[sp_name]
}
})
