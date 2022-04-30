

import Dcl from './dcl'
import { $actions$handle_attr } from './handleState/rebuild'
import { $actions$handle_rel } from './handleNesting/rebuild'
import { $actions$handleInit } from './handleInit/rebuild'
import { cacheFields } from '../cachedField'


const schema = {
  $actions$combo: [['$in$actions'], (val) => val],
  $actions$handle_attr,
  $actions$handle_rel,
  $actions$handleInit,
}

export const checkInputActions = (self) => {
  const actions = self.hasOwnProperty('actions') && self.actions
  if (!actions) {
    return
  }

  const result = {
    ...self.$in$actions,
  }

  for (const name in actions) {
    if (!actions.hasOwnProperty(name)) {
      continue
    }
    result[name] = new Dcl(name, actions[name])
  }

  self.$in$actions = result

}

export default function checkPasses(self) {
  cacheFields(schema, self)
}
