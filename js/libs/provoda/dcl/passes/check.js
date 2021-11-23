

import spv from '../../../spv'
import Dcl from './dcl'
import rebuildHandleState from './handleState/rebuild'
import rebuildHandleNesting from './handleNesting/rebuild'
import rebuildHandleInit from './handleInit/rebuild'
const cloneObj = spv.cloneObj

export default function checkPasses(self) {
  const actions = self.hasOwnProperty('actions') && self.actions
  if (!actions) {
    return
  }

  const result = {}
  cloneObj(result, self._extendable_passes_index || {})

  for (const name in actions) {
    if (!actions.hasOwnProperty(name)) {
      continue
    }
    result[name] = new Dcl(name, actions[name])
  }

  rebuildHandleState(self, result)
  rebuildHandleNesting(self, result)
  rebuildHandleInit(self, result)

  self._extendable_passes_index = result
}
