define(function (require) {
'use strict'
var spv = require('spv')
var cloneObj = spv.cloneObj
var utils_simple = require('../../utils/simple');
var wipeObj = utils_simple.wipeObj

return function(runner) {
  var self = runner.md
  var result = wipeObj(self.__modern_subpages)
  self.__modern_subpages = null

  for (var i = self.__routes_matchers_runs.length - 1; i >= 0; i--) {
    var cur = self.__routes_matchers_runs[i]
    if (!cur.matched) {
      continue
    }

    result = result || {}
    cloneObj(result, cur.matched)
  }


  self.__modern_subpages = result
}
})
