
import _goDeeper from './_goDeeper'
import showMOnMap from './showMOnMap'
import getRouteStepParent from './getRouteStepParent'

export default function showInterest(map, interest) {
  var BWL = map.app.CBWL

  if (!interest.length) {
    return showMOnMap(BWL, map, map.mainLevelResident)
  }

  var first = interest.shift()
  // first.md.lev fixme

  var parent_bwlev = showMOnMap(BWL, map, first.md)

  for (var i = 0; i < interest.length; i++) {
    var cur = interest[i]

    var distance = cur.distance
    if (!distance) {throw new Error('must be distance: 1 or more')}
    while (distance) {
      var md = getDistantModel(map, interest[i].md, distance)
      parent_bwlev = _goDeeper(BWL, map, md, parent_bwlev)
      distance--
    }


  }

  return parent_bwlev
}

function getDistantModel(map, md, distance) {
  var cur = md
  for (var i = 1; i < distance; i++) {
    cur = getRouteStepParent(map, cur)
  }
  return cur
}
