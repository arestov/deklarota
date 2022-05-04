
import memorize from '../../spv/memorize'
import utils_simple from '../utils/simple'
import _updateAttr from '../_internal/_updateAttr'


const getLightConnector = memorize(function(state_name) {
  return function updateStateBindedLightly(value) {
    _updateAttr(this, state_name, value)
  }
})
const wlch = {
  wlch: function(donor, donor_state, acceptor_state_name) {
    const cb = getLightConnector(acceptor_state_name, donor_state)

    const event_name = utils_simple.getSTEVNameLight(donor_state)
    donor.evcompanion._addEventHandler(event_name, cb, this, null, null, true)
  },
  unwlch: function(donor, donor_state, acceptor_state_name) {
    const cb = getLightConnector(acceptor_state_name, donor_state)
    this.removeLwch(donor, donor_state, cb)
  },
}

export default wlch
