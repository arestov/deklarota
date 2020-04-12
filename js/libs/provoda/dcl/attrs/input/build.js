define(function() {
'use strict'
return function(self, props, byName) {
  if (!byName) {
    return
  }

  var result = {}
  for (var attr_name in byName) {
    var cur = byName[attr_name]
    result[attr_name] = cur[0]
  }

  self.__default_attrs = result
}
})
