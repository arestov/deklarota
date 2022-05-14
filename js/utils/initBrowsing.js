import BrowseMap from '../libs/BrowseMap'
import changeBridge from '../libs/provoda/bwlev/changeBridge'
import showInterest from '../libs/provoda/bwlev/showInterest'
import { hookSessionRoot } from '../libs/provoda/provoda/BrowseMap'
// import animateMapChanges from '../libs/provoda/dcl/probe/animateMapChanges'

function initBrowsing(app, states) {
  const map = hookSessionRoot(app, app.start_page, states)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  app.map = map

  const bwlev = showInterest(map, [])
  changeBridge(bwlev)

  return map
}

export default initBrowsing
