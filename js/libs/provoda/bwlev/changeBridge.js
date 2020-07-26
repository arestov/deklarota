define(function (require) {
'use strict';
var showMOnMap = require('./showMOnMap')
var _updateAttr = require('_updateAttr');
var _updateRel = require('_updateRel');

var redirected = function(map, pioneer) {
  var BWL = map.app.CBWL;

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
    _updateRel(map, 'current_bwlev', bwlev)
    _updateRel(map, 'current_md', bwlev && bwlev.getNesting('pioneer'))
    if (bwlev) {
      _updateRel(bwlev, 'focus_referrer_bwlev', map.getNesting('current_mp_bwlev'))
    }
    return
  }

  var copy = bwlev.ptree.slice();
  copy.reverse();

  _updateRel(map, 'wanted_bwlev_chain', copy);
  _updateRel(bwlev, 'focus_referrer_bwlev', map.getNesting('current_mp_bwlev'))
  _updateAttr(bwlev, 'currentReq', null)
  return bwlev;
}
});
