

import spv from 'spv'
var cloneObj = spv.cloneObj
import Dcl from './dcl'
import rebuildHandleState from './handleState/rebuild'
import rebuildHandleNesting from './handleNesting/rebuild'
import rebuildHandleInit from './handleInit/rebuild'

export default function checkPasses(self, props) {
  if (!props.hasOwnProperty('actions')) {
    return
  }

  var result = {}
  cloneObj(result, self._extendable_passes_index || {})

  for (var name in props['actions']) {
    if (!props['actions'].hasOwnProperty(name)) {
      continue
    }
    result[name] = new Dcl(name, props['actions'][name])
  }

  rebuildHandleState(self, result)
  rebuildHandleNesting(self, result)
  rebuildHandleInit(self, result)

  self._extendable_passes_index = result
}
