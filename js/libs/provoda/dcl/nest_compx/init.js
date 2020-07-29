define(function(require) {
'use strict';

var Runner = require('./runner')

var empty = {}

return function (self) {
  self.__nest_calculations = empty // show js engine real type
  self.__nest_calculations = null

  if (!self._nest_by_type_listed || !self._nest_by_type_listed.compx) {
    return;
  }

  self.__nest_calculations = {}

  var compx_list = self._nest_by_type_listed.compx

  for (var i = 0; i < compx_list.length; i++) {
    var cur = compx_list[i]
    self.__nest_calculations[cur.dest_name] = new Runner(self, cur);
  }
}
})
