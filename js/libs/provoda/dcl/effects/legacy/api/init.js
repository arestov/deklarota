
import { hasOwnProperty } from '../../../../hasOwnProperty'


function needsSelf(self) {
  if (self.__apis_$__needs_self == true) {
    return true
  }

  return self.__api_effects_out?.index_by_apis && self.__api_effects_out?.index_by_apis['self']
}

export const dispose = function(self) {

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

export default function initApis(self, apis_as_arg) {

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

  if (needsSelf(self)) {
    self.useInterface('self', self)
  }
}
