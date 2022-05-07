

import _updateAttrsByChanges from '../_internal/_updateAttrsByChanges'
import runOnApiAdded from '../dcl/effects/legacy/subscribe/runOnApiAdded'
import runOnApiRemoved from '../dcl/effects/legacy/subscribe/runOnApiRemoved'
import checkInitedApi from '../dcl/effects/legacy/produce/checkInitedApi'
import usedInterfaceAttrName from '../dcl/effects/usedInterfaceAttrName'
import { FlowStepUseInterface } from '../Model/flowStepHandlers.types'


export function __reportInterfaceChange(interface_name, value) {
  this.__updateInteraceState(this, interface_name, value)
}

export function __updateInteraceState(self, interface_name, value) {
  const name_for_used_modern = usedInterfaceAttrName(interface_name)

  self._attrs_collector.defineAttr(name_for_used_modern, 'bool')

  _updateAttrsByChanges(self, [
    name_for_used_modern, value,
  ])
}

const ensurePrevApiRemoved = (self, interface_name, destroy) => {
  const old_interface = self.getInterface(interface_name)
  if (old_interface == null) {
    return
  }


  if (self._interfaces_used[interface_name] != null) {
    self._interfaces_used[interface_name] = null
  }


  runOnApiRemoved(self, interface_name)

  if (old_interface && destroy) {
    destroy(old_interface)
  }
}

export const useInterfaceHandler = function(self, interface_name, obj, destroy) {
  const old_interface = self._interfaces_used[interface_name]
  if (obj === old_interface || (obj == null && old_interface == null)) {
    return
  }

  ensurePrevApiRemoved(self, interface_name, destroy)

  if (!obj) {
    self.__reportInterfaceChange(interface_name, false)
    return
  }

  if (Object.isFrozen(self._interfaces_used)) {
    self._interfaces_used = {}
  }

  self._interfaces_used[interface_name] = obj



  runOnApiAdded(self, interface_name)

  self.__reportInterfaceChange(interface_name, Date.now())

  checkInitedApi(self, interface_name)
}

useInterfaceHandler.skipAliveCheck = true

export default function useInterfaceWrap(self, interface_name, obj, destroy) {
  if (self == null) {
    console.error(new Error(`Couldn't use "${interface_name}" interface in ${self}.`))
    return undefined
  }
  self.inputWithContext(FlowStepUseInterface, [self, interface_name, obj, destroy])
}
