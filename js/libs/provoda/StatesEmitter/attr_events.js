import subscribeToDie from '../internal_events/die/subscribe'
import utils_simple from '../utils/simple'

const attr_events = {
  onDie: function(cb) {
    subscribeToDie(this, cb)
  },
  _bindLight: function(donor, state_name, cb) {
    const event_name = utils_simple.getSTEVNameLight(state_name)
    donor.evcompanion._addEventHandler(event_name, cb, this)

    this.onDie(function() {
      if (!donor) {
        return
      }
      this.removeLwch(donor, state_name, cb)
      donor = null
      cb = null
    })
  },
  lwch: function(donor, donor_state, func) {
    this._bindLight(donor, donor_state, func)
  },
  removeLwch: function(donor, donor_state, func) {
    donor.evcompanion.off(utils_simple.getSTEVNameLight(donor_state), func, false, this)
  },
}

export default attr_events
