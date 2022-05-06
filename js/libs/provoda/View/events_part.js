import attr_events from '../AttrsOwner/attr_events'
import FastEventor from '../FastEventor/index'
import wlch from './wlch'

export const events_part = {
  ...wlch,
  ...attr_events,
  off: function(namespace, cb, obj, context) {
    return this.evcompanion.off(namespace, cb, obj, context)
  },
}

export const initEvents = (self) => {
  self.evcompanion = new FastEventor(self)
}
