
import memorize from '../../../../../spv/memorize'
import { hasOwnProperty } from '../../../../hasOwnProperty'
import { isView } from '../../../../isView'
import usedInterfaceAttrName from '../../usedInterfaceAttrName'


const updateRootInterface = memorize(function(name) {
  return function(val) {
    const interface_instance = val
      ? this.getStrucRoot().getInterface(name)
      : null
    this.useInterface('#' + name, interface_instance)
  }
})

const watchInterface = function(self, from, interface_name, fn) {
  const meta_state_name = usedInterfaceAttrName(interface_name)
  self.lwch(from, meta_state_name, fn)
}

const unwatchInterface = function(self, from, interface_name, fn) {
  const meta_state_name = usedInterfaceAttrName(interface_name)
  self.removeLwch(from, meta_state_name, fn)
}


const connectRootApis = function(self, list) {
  if (!isView(self)) {
    return
  }
  if (!list) {
    return
  }
  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    watchInterface(self, self.getStrucRoot(), cur, updateRootInterface(cur))
  }
}

const disconnectRootApis = function(self, list) {
  if (!isView(self)) {
    return
  }
  if (!list) {
    return
  }
  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    unwatchInterface(self, self.getStrucRoot(), cur, updateRootInterface(cur))
  }
}

function needsSelf(self) {
  if (self.__apis_$__needs_self == true) {
    return true
  }

  return self.__api_effects_out?.index_by_apis && self.__api_effects_out?.index_by_apis['self']
}

export const dispose = function(self) {
  disconnectRootApis(self, self.__dcls_list_api_to_connect)

  if (self.__apis_$_index) {
    for (const name in self.__apis_$_index) {
      if (!hasOwnProperty(self.__apis_$_index, name)) {
        continue
      }
      const declr = self.__apis_$_index[name]

      self.useInterface(declr.name, null, declr.destroy)
    }
  }

  for (const name in self._interfaces_used) {
    if (!hasOwnProperty(self._interfaces_used, name)) {
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

  connectRootApis(self, self.__dcls_list_api_to_connect)

  if (needsSelf(self)) {
    self.useInterface('self', self)
  }
}
