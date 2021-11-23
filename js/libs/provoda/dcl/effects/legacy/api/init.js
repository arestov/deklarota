
import spv from '../../../../../spv'
const updateRootInterface = spv.memorize(function(name) {
  return function(val) {
    const interface_instance = val
      ? this.getStrucRoot().getInterface(name)
      : null
    this.useInterface('#' + name, interface_instance)
  }
})
const connectRootApis = function(self, list) {
  if (!list) {
    return
  }
  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    self.watchInterface(self.getStrucRoot(), cur, updateRootInterface(cur))
  }
}

const disconnectRootApis = function(self, list) {
  if (!list) {
    return
  }
  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
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

  if (self.__apis_$_index) {
    for (const name in self.__apis_$_index) {
      if (!self.__apis_$_index.hasOwnProperty(name)) {
        continue
      }
      const declr = self.__apis_$_index[name]

      self.useInterface(declr.name, null, declr.destroy)
    }
  }

  for (const name in self._interfaces_used) {
    if (!self._interfaces_used.hasOwnProperty(name)) {
      continue
    }
    self.useInterface(name, null)
  }
}

export default function(self, apis_as_arg) {

  if (apis_as_arg) {
    for (const name in apis_as_arg) {
      self.useInterface(name, apis_as_arg[name])
    }
  }

  if (self.__apis_$_usual && self.__apis_$_usual.length) {
    for (let i = 0; i < self.__apis_$_usual.length; i++) {
      const cur = self.__apis_$_usual[i]
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
