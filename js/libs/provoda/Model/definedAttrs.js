import definedMetaAttrs from './rel/definedMetaAttrs'

var push = Array.prototype.push

export default function(self) {
  if (self.__defined_attrs_bool) {
    return self.__defined_attrs_bool
  }

  var result = [{name: '$meta$inited', type: 'bool'}, {name: '$meta$removed', type: 'bool'}]

  // Default attrs
  if (self.__default_attrs) {
    for (var attr in self.__default_attrs) {
      if (!self.__default_attrs.hasOwnProperty(attr)) {
        continue
      }
      result.push({name: attr})
    }
  }

  // Compx attrs
  if (self.full_comlxs_list) {
    for (var i = 0; i < self.full_comlxs_list.length; i++) {
      var cur = self.full_comlxs_list[i]
      var isFullBool = cur.fn === Boolean && !cur.require_marks.length
      result.push({name: cur.name, type: isFullBool ? 'bool' : null})
    }
  }


  // Meta attrs of requests
  if (self._states_reqs_list) {
    for (var i = 0; i < self._states_reqs_list.length; i++) {
      var cur = self._states_reqs_list[i]
      push.apply(result, cur.boolean_attrs)
    }
  }

  // Meta attrs of apis
  if (self.__defined_api_attrs_bool) {
    push.apply(result, self.__defined_api_attrs_bool)
  }

  if (self._extendable_nest_index) {
    var rels = self._extendable_nest_index
    for (var rel_name in rels) {
      if (!rels.hasOwnProperty(rel_name)) {
        continue
      }
      var list = definedMetaAttrs(rel_name)
      for (var kk = 0; kk < list.length; kk++) {
        var cur = list[kk]
        var [attr_name, type] = cur
        result.push({name: attr_name, type: type || null})
      }
    }
  }


  self.__defined_attrs_bool = result


  // DONT NOT PREDEFINE things that could be bool (like $routed, $length)

  // for (var i = 0; i < self.full_comlxs_list.length; i++) {
  //   var cur = self.full_comlxs_list[i]
  //   for (var jj = 0; jj < cur.watch_list.length; jj++) {
  //     result.push({name: cur.name, type: cur.fn === Boolean ? 'bool' : null})
  //   }
  // }

  return result


};
