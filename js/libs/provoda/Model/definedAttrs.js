import { hasEveryArgs } from '../../spv'
import { hasOwnProperty } from '../hasOwnProperty'
import definedMetaAttrs from './rel/definedMetaAttrs'

const push = Array.prototype.push

const doesFnReturnsBool = (fn) => {
  switch (fn) {
    case Boolean:
    case hasEveryArgs:
      return true
  }

  return false
}

export default function(self) {
  if (self.__defined_attrs_bool) {
    return self.__defined_attrs_bool
  }

  const result = [{name: '$meta$inited', type: 'bool'}, {name: '$meta$removed', type: 'bool'}]

  // Default attrs
  if (self.__default_attrs) {
    for (const attr in self.__default_attrs) {
      if (!self.__default_attrs.hasOwnProperty(attr)) {
        continue
      }
      result.push({name: attr})
    }
  }

  // Compx attrs
  if (self.full_comlxs_list) {
    for (let i = 0; i < self.full_comlxs_list.length; i++) {
      const cur = self.full_comlxs_list[i]
      const isFullBool = cur.is_bool || doesFnReturnsBool(cur.fn) && !cur.require_marks.length
      result.push({name: cur.name, type: isFullBool ? 'bool' : null})
    }
  }


  // Meta attrs of requests
  if (self._states_reqs_list) {
    for (let i = 0; i < self._states_reqs_list.length; i++) {
      const cur = self._states_reqs_list[i]
      for (let i = 0; i < cur.boolean_attrs.length; i++) {
        const bool_attr = cur.boolean_attrs[i]

        if (!hasOwnProperty(self.__default_attrs, bool_attr.name)) {
          continue
        }

        result.push(bool_attr)
      }
    }
  }

  // Meta attrs of apis
  if (self.__defined_api_attrs_bool) {
    push.apply(result, self.__defined_api_attrs_bool)
  }

  if (self._extendable_nest_index) {
    const rels = self._extendable_nest_index
    for (const rel_name in rels) {
      if (!rels.hasOwnProperty(rel_name)) {
        continue
      }
      const list = definedMetaAttrs(rel_name)
      for (let kk = 0; kk < list.length; kk++) {
        const cur = list[kk]
        const [attr_name, type] = cur
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
