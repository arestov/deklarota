define(function (require) {
'use strict';
var showMOnMap = require('./showMOnMap')
var _updateAttr = require('_updateAttr');

var redirected = function(map, pioneer) {
  var BWL = map.BWL; // kinda hack?! TODO FIXME

  var redirectBWLev = pioneer.redirectBWLev
  if (!redirectBWLev) {
    return null
  }

  return showMOnMap(BWL, map, redirectBWLev(pioneer));

}

return function changeBridge(bwlev_raw, map_raw) {
  var bwlev = bwlev_raw && (redirected(bwlev_raw.map, bwlev_raw.getNesting('pioneer')) || bwlev_raw)
  var map = map_raw || (bwlev && bwlev.map)

  if (!map) {
    console.warn('no bw map')
  }

  if (map.bridge_bwlev === bwlev) {
    return bwlev;
  }

  map.bridge_bwlev = bwlev;

  if (map.is_simple_router) {
    map.updateNesting('current_bwlev', bwlev)
    map.updateNesting('current_md', bwlev && bwlev.getNesting('pioneer'))
    if (bwlev) {
      bwlev.updateNesting('focus_referrer_bwlev', map.getNesting('current_mp_bwlev'))
    }
    return
  }

  var copy = bwlev.ptree.slice();
  copy.reverse();

  map.updateNesting('wanted_bwlev_chain', copy);
  bwlev.updateNesting('focus_referrer_bwlev', map.getNesting('current_mp_bwlev'))
  _updateAttr(bwlev, 'currentReq', null)
  return bwlev;
}
});
