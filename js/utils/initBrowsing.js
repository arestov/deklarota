import BrowseMap from '../libs/BrowseMap'
import showInterest from '../libs/provoda/bwlev/showInterest'
// import animateMapChanges from '../libs/provoda/dcl/probe/animateMapChanges'

function initBrowsing(app, states) {
  const map = BrowseMap.hookRoot(app, app.start_page, states)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  app.map = map

  const bwlev = showInterest(map, [])
  BrowseMap.changeBridge(bwlev)

  return map
}

export default initBrowsing
