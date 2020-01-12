define(function(require) {
'use strict';
var addFrom = require('../../nest-watch/addFrom');
var RouteRunner = require('./RouteRunner')


return function(self) {
  if (!self.__routes_matchers_defs) {
    return;
  }

  self.__modern_subpages = null;

  var list = new Array(self.__routes_matchers_defs.length)

  for (var i = 0; i < self.__routes_matchers_defs.length; i++) {
    var cur = self.__routes_matchers_defs[i]
    var cur = new RouteRunner(self, cur)
    list[i] = cur
    addFrom(self, cur.lnwatch);
  }

  self.__routes_matchers_runs = list

}
})
