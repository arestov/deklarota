
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

function needsSelf(self) {
  if (self.__apis_$__needs_self == true) {
    return true
  }

  return self.__api_effects_$_index_by_apis && self.__api_effects_$_index_by_apis['self']
}

export const dispose = function(self) {
  disconnectRootApis(self, self.__apis_$__needs_root_apis)
  disconnectRootApis(self, self.__api_root_dep_apis)
  disconnectRootApis(self, self.__api_root_dep_apis_subscribe_eff)

  if (self._interfaces_using == null || self._interfaces_using.used == null) {
    return
  }

  if (self.__apis_$_index) {
    for (var name in self.__apis_$_index) {
      if (!self.__apis_$_index.hasOwnProperty(name)) {
        continue
      }
      var declr = self.__apis_$_index[name]

      self.useInterface(declr.name, null, declr.destroy)
    }
  }

  for (var name in self._interfaces_using.used) {
    if (!self._interfaces_using.used.hasOwnProperty(name)) {
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

  if (self.__apis_$_usual && self.__apis_$_usual.length) {
    for (var i = 0; i < self.__apis_$_usual.length; i++) {
      var cur = self.__apis_$_usual[i]
      self.useInterface(cur.name, cur.fn())
    }
  }

  connectRootApis(self, self.__apis_$__needs_root_apis)
  connectRootApis(self, self.__api_root_dep_apis)
  connectRootApis(self, self.__api_root_dep_apis_subscribe_eff)

  if (needsSelf(self)) {
    self.useInterface('self', self)
  }
}
