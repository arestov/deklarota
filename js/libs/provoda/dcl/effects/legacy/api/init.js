
import spv from '../../../../../spv'
var updateRootInterface = spv.memorize(function(name) {
  return function(val) {
    var interface_instance = val
      ? this.getStrucRoot().getInterface(name)
      : null
    this.useInterface('#' + name, interface_instance)
  }
})
var connectRootApis = function(self, list) {
  if (!list) {
    return
  }
  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    self.watchInterface(self.getStrucRoot(), cur, updateRootInterface(cur))
  }
}

var disconnectRootApis = function(self, list) {
  if (!list) {
    return
  }
  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    self.unwatchInterface(self.getStrucRoot(), cur, updateRootInterface(cur))
  }
}

function needsSelf(rt_schema) {
  if (rt_schema.__apis_$__needs_self == true) {
    return true
  }

  return rt_schema.__api_effects_$_index_by_apis && rt_schema.__api_effects_$_index_by_apis['self']
}

export const dispose = function(self) {
  const rt_schema = self.rt_schema
  disconnectRootApis(self, rt_schema.__apis_$__needs_root_apis)
  disconnectRootApis(self, rt_schema.__api_root_dep_apis)
  disconnectRootApis(self, rt_schema.__api_root_dep_apis_subscribe_eff)

  if (rt_schema.__apis_$_index) {
    for (var name in rt_schema.__apis_$_index) {
      if (!rt_schema.__apis_$_index.hasOwnProperty(name)) {
        continue
      }
      var declr = rt_schema.__apis_$_index[name]

      self.useInterface(declr.name, null, declr.destroy)
    }
  }

  for (var name in self._interfaces_used) {
    if (!self._interfaces_used.hasOwnProperty(name)) {
      continue
    }
    self.useInterface(name, null)
  }
}

export default function(self, apis_as_arg) {

  if (apis_as_arg) {
    for (var name in apis_as_arg) {
      self.useInterface(name, apis_as_arg[name])
    }
  }

  const rt_schema = self.rt_schema

  if (rt_schema.__apis_$_usual && rt_schema.__apis_$_usual.length) {
    for (var i = 0; i < rt_schema.__apis_$_usual.length; i++) {
      var cur = rt_schema.__apis_$_usual[i]
      self.useInterface(cur.name, cur.fn())
    }
  }

  connectRootApis(self, rt_schema.__apis_$__needs_root_apis)
  connectRootApis(self, rt_schema.__api_root_dep_apis)
  connectRootApis(self, rt_schema.__api_root_dep_apis_subscribe_eff)

  if (needsSelf(rt_schema)) {
    self.useInterface('self', self)
  }
}
