
import _goDeeper from './_goDeeper'
import getModelById from '../utils/getModelById'
import changeBridge from './changeBridge'
import showMOnMap from './showMOnMap'
import getRouteStepParent from './getRouteStepParent'
import getBwlevMap from './getBwlevMap'
import execAction from '../dcl/passes/execAction'

const isNavChild = (map, possible_parent_bwlev, pioneer) => {
  let cur = possible_parent_bwlev
  const bwlev_children = []
  let target_is_deep_child

  while (getRouteStepParent(map, cur)) {
    bwlev_children.push(cur)

    if (getRouteStepParent(map, cur) == pioneer) {
      target_is_deep_child = true
      break
    }
    cur = getRouteStepParent(map, cur)
  }

  if (!target_is_deep_child) {
    return null
  }

  return bwlev_children
}

export default function requestPage(self, id) {
  const md = getModelById(self, id)
  const pioneer = self.getNesting('pioneer')

  const map = getBwlevMap(self)
  let bwlev_children = isNavChild(map, md, pioneer)

  if (bwlev_children == null) {
    /* No need to keep browsing stacking-context */
    execAction(map, 'showModel', md)
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
    execAction(map, 'showBwlev', last_called)
  }

}
