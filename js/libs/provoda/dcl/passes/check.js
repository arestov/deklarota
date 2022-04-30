

import spv from '../../../spv'
import Dcl from './dcl'
import { $actions$handle_attr } from './handleState/rebuild'
import rebuildHandleNesting from './handleNesting/rebuild'
import rebuildHandleInit from './handleInit/rebuild'
import { cacheFields } from '../cachedField'
const cloneObj = spv.cloneObj


const schema = {
  $actions$handle_attr,
}

export default function checkPasses(self) {
  const actions = self.hasOwnProperty('actions') && self.actions
  if (!actions) {
    return
  }

  const result = {}
  cloneObj(result, self.$in$actions || {})

  for (const name in actions) {
    if (!actions.hasOwnProperty(name)) {
      continue
    }
    result[name] = new Dcl(name, actions[name])
  }

  self.$in$actions = result

  cacheFields(schema, self)

  rebuildHandleNesting(self, result)
  rebuildHandleInit(self, result)

  self._extendable_passes_index = result
}
