

import spv from '../../spv'
import _updateAttrsByChanges from '../_internal/_updateAttrsByChanges'
import runOnApiAdded from '../dcl/effects/legacy/subscribe/runOnApiAdded'
import runOnApiRemoved from '../dcl/effects/legacy/subscribe/runOnApiRemoved'

var template = function() {
  return {
    indexes: {},

    /*
      value - true, когда есть все нужные api
      при смене value для state происходит bind.
      при value === false происходит unbind
    */
    values: {},
    removers: {}
  }
}

export function __reportInterfaceChange(interface_name, value) {
  this.__updateInteraceState(this, interface_name, value)
}


export function __updateInteraceState(self, interface_name, value) {
  var name_for_used_modern = '$meta$apis$' + interface_name + '$used'

  self._attrs_collector.defineAttr(name_for_used_modern, 'bool')

  _updateAttrsByChanges(self, [
    name_for_used_modern, value,
  ])
}

var useInterface = function(self, interface_name, obj, destroy) {
  var old_interface = self._interfaces_used[interface_name]
  if (obj === old_interface || (obj == null && old_interface == null)) {
    return
  }

  var binders = self._interfaces_binders
  if (!binders) {
    binders = self._interfaces_binders = template()
  }

  var values_original = spv.cloneObj({}, binders.values)

  if (self._interfaces_used[interface_name] != null) {
    self._interfaces_used[interface_name] = null
  }


  binders = runOnApiRemoved(self, binders, interface_name, values_original)
  self._interfaces_binders = binders

  if (old_interface && destroy) {
    destroy(old_interface)
  }

  if (!obj) {
    self.__reportInterfaceChange(interface_name, false)
    return
  }

  var values_original2 = spv.cloneObj({}, binders.values)

  if (Object.isFrozen(self._interfaces_used)) {
    self._interfaces_used = {}
  }

  self._interfaces_used[interface_name] = obj
  binders = runOnApiAdded(self, binders, interface_name, values_original2)
  self._interfaces_binders = binders

  self.__reportInterfaceChange(interface_name, Date.now())

}

useInterface.skipAliveCheck = true

export default function useInterfaceWrap(self, interface_name, obj, destroy) {
  if (self == null) {
    console.error(new Error(`Couldn't use "${interface_name}" interface in ${self}.`))
    return undefined
  }
  self.nextTick(useInterface, [self, interface_name, obj, destroy], false, false)
}
