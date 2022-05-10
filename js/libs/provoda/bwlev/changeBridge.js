
import showMOnMap from './showMOnMap'
import _updateAttr from '../_internal/_updateAttr'
import _updateRel from '../_internal/_updateRel'
import getAliveNavPioneer from './getAliveNavPioneer'
import getRel from '../provoda/getRel'

const getRedirectedCursor = (map, pioneer) => {

  const { selectPreferredCursor } = map
  if (selectPreferredCursor) {
    return getAliveNavPioneer(map, selectPreferredCursor(map, pioneer) || pioneer)
  }

  return getAliveNavPioneer(map, pioneer)
}

const redirected = function(map, pioneer) {
  const redirected_cursor = getRedirectedCursor(map, pioneer) || getRel(map, 'mainLevelResident')
  if (redirected_cursor == pioneer) {
    return null
  }
  return showMOnMap(map, redirected_cursor)
}

const resetNavigationRequests = (router, bwlev) => {
  _updateAttr(router, 'current_expected_rel', undefined)
  _updateAttr(bwlev, 'currentReq', null)
}

export default function changeBridge(bwlev_raw, map_raw) {
  const bwlev = bwlev_raw && (redirected(bwlev_raw.map, bwlev_raw.getNesting('pioneer')) || bwlev_raw)
  const map = map_raw || (bwlev && bwlev.map)

  if (!map) {
    console.warn('no bw map')
  }

  if (map.bridge_bwlev === bwlev) {
    if (!map.is_simple_router) {
      resetNavigationRequests(map, bwlev)
    }
    return bwlev
  }

  map.bridge_bwlev = bwlev

  if (map.is_simple_router) {
    _updateRel(map, 'current_bwlev', bwlev)
    _updateRel(map, 'current_md', bwlev && bwlev.getNesting('pioneer'))
    if (bwlev) {
      _updateRel(bwlev, 'focus_referrer_bwlev', map.getNesting('current_mp_bwlev'))
    }
    return
  }

  _updateRel(bwlev, 'focus_referrer_bwlev', map.getNesting('current_mp_bwlev'))
  resetNavigationRequests(map, bwlev)
  _updateRel(map, 'wanted_bwlev', bwlev)

  return bwlev
}
