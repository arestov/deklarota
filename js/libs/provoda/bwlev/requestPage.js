
import _goDeeper from './_goDeeper'
import getModelById from '../utils/getModelById'
import changeBridge from './changeBridge'
import showMOnMap from './showMOnMap'
import getRouteStepParent from './getRouteStepParent'
import getBwlevMap from './getBwlevMap'

export default function requestPage(self, id) {
  const md = getModelById(self, id)
  const pioneer = self.getNesting('pioneer')

  let target_is_deep_child

  let cur = md
  let bwlev_children = []

  const map = getBwlevMap(self)

  while (getRouteStepParent(map, cur)) {
    bwlev_children.push(cur)

    if (getRouteStepParent(map, cur) == pioneer) {
      target_is_deep_child = true
      break
    }
    cur = getRouteStepParent(map, cur)
  }


  if (!target_is_deep_child) {
    /* No need to keep browsing stacking-context */

    const bwlev = showMOnMap(map, md)
    changeBridge(bwlev)
    return
  }

  /*
    Let's try to keep browsing stacking-context
  */

  bwlev_children = bwlev_children.reverse()

  // !!!!showMOnMap( map, pioneer, self);

  let last_called = null
  let parent_bwlev = self
  for (let i = 0; i < bwlev_children.length; i++) {
    if (!parent_bwlev) {
      continue
    }
    const cur_md = bwlev_children[i]

    parent_bwlev = _goDeeper(map, cur_md, parent_bwlev)
    last_called = parent_bwlev
  }

  if (last_called) {
    changeBridge(last_called)
  }

}
