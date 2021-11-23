
import _goDeeper from './_goDeeper'
import showMOnMap from './showMOnMap'
import getRouteStepParent from './getRouteStepParent'

export default function showInterest(map, interest) {
  const BWL = map.app.CBWL

  if (!interest.length) {
    return showMOnMap(BWL, map, map.mainLevelResident)
  }

  const first = interest.shift()
  // first.md.lev fixme

  let parent_bwlev = showMOnMap(BWL, map, first.md)

  for (let i = 0; i < interest.length; i++) {
    const cur = interest[i]

    let distance = cur.distance
    if (!distance) {throw new Error('must be distance: 1 or more')}
    while (distance) {
      const md = getDistantModel(map, interest[i].md, distance)
      parent_bwlev = _goDeeper(BWL, map, md, parent_bwlev)
      distance--
    }


  }

  return parent_bwlev
}

function getDistantModel(map, md, distance) {
  let cur = md
  for (let i = 1; i < distance; i++) {
    cur = getRouteStepParent(map, cur)
  }
  return cur
}
