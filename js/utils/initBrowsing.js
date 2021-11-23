import BrowseMap from '../libs/BrowseMap'
import _updateRel from '../libs/provoda/_internal/_updateRel'
// import animateMapChanges from '../libs/provoda/dcl/probe/animateMapChanges'

function initMapTree(app, start_page) {
// app.useInterface('navi', needs_url_history && navi);
  _updateRel(app, 'navigation', [])
  _updateRel(app, 'start_page', start_page)


  return app.map
}


function initBrowsing(app, states) {
  const map = BrowseMap.hookRoot(app, app.start_page, states)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  app.map = map

  initMapTree(app, app.start_page)

  const bwlev = BrowseMap.showInterest(map, [])
  BrowseMap.changeBridge(bwlev)

  return map
}

export default initBrowsing
