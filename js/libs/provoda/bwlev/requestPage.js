
import _goDeeper from './_goDeeper'
import getModelById from '../utils/getModelById'
import changeBridge from './changeBridge'
import showMOnMap from './showMOnMap'
import getRouteStepParent from './getRouteStepParent'

export default function requestPage(BWL, self, id) {
  var md = getModelById(self, id)
  var pioneer = self.getNesting('pioneer')

  var target_is_deep_child

  var cur = md
  var bwlev_children = []

  var map = self.map

  while (getRouteStepParent(map, cur)) {
    bwlev_children.push(cur)

    if (getRouteStepParent(map, cur) == pioneer) {
      target_is_deep_child = true
      break
    }
    cur = getRouteStepParent(map, cur)
  }


  if (!target_is_deep_child) {

    var bwlev = showMOnMap(BWL, map, md)
    changeBridge(bwlev)
    return
  }

  bwlev_children = bwlev_children.reverse()

  // !!!!showMOnMap(BWL, map, pioneer, self);

  var last_called = null
  var parent_bwlev = self
  for (var i = 0; i < bwlev_children.length; i++) {
    if (!parent_bwlev) {
      continue
    }
    var cur_md = bwlev_children[i]

    parent_bwlev = _goDeeper(BWL, map, cur_md, parent_bwlev)
    last_called = parent_bwlev
  }

  if (last_called) {
    changeBridge(last_called)
  }

}
