define(function() {
'use strict'
var push = Array.prototype.push;

return function(self) {
  if (self.__defined_attrs_bool) {
    return self.__defined_attrs_bool
  }

  var result = [{name: '$meta$inited', type: 'bool'}]

  if (self._states_reqs_list) {
    for (var i = 0; i < self._states_reqs_list.length; i++) {
      var cur = self._states_reqs_list[i]
      push.apply(result, cur.boolean_attrs)
    }
  }

  if (self.__defined_api_attrs_bool) {
    push.apply(result, self.__defined_api_attrs_bool)
  }

  self.__defined_attrs_bool = result
  return result


}
})
