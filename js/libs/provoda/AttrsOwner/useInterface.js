

import _updateAttrsByChanges from '../_internal/_updateAttrsByChanges'
import checkInitedApi from '../dcl/effects/legacy/produce/checkInitedApi'
import usedInterfaceAttrName from '../dcl/effects/usedInterfaceAttrName'
import { FlowStepUseInterface } from '../Model/flowStepHandlers.types'
import markApi from '../dcl/effects/legacy/subscribe/run/markApi'
import makeBindChanges from '../dcl/effects/legacy/subscribe/run/makeBindChanges'


export function __reportInterfaceChange(interface_name, value) {
  this.__updateInteraceState(this, interface_name, value)
}

export function __updateInteraceState(self, interface_name, value) {
  const name_for_used_modern = usedInterfaceAttrName(interface_name)

  self._attrs_collector.defineAttr(name_for_used_modern)

  _updateAttrsByChanges(self, [
    name_for_used_modern, value,
  ])
}

const ensurePrevApiRemoved = (self, interface_name, destroy) => {
  const old_interface = self.getInterface(interface_name)
  if (old_interface == null) {
    return
  }

  const prev_values = markApi(self, interface_name)
  self._interfaces_used[interface_name] = null
  const next_values = markApi(self, interface_name)

  makeBindChanges(self, prev_values, next_values)

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


  const prev_values = markApi(self, interface_name)
  self._interfaces_used[interface_name] = obj
  const next_values = markApi(self, interface_name)

  makeBindChanges(self, prev_values, next_values)

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
