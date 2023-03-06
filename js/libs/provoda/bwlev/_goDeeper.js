
import pvState from '../utils/state'
import createLevel from './createLevel'
import getBwlevFromParentBwlev from './getBwlevFromParentBwlev'
import toProperNavParent from './toProperNavParent'
import getRouteStepParent from './getRouteStepParent'
import isStart from './isStart'
import getRel from '../provoda/getRel'
import findByPioneer from './findByPioneer'

export default function _goDeeper(map, md, parent_bwlev, freeze_parent_bwlev) {
  /*
    freeze_parent_bwlev in combination with specific parent_bwlev
    used to show some content in unusual context, in context different from

    e.g. show "person" as "child" in "friends list" of another person.
  */
  // без parent_bwlev нет контекста
  if (!parent_bwlev) {
    // будем искать parent_bwlev на основе прямой потомственности от уровня -1
    parent_bwlev = getBwlevInParentBwlev(toProperNavParent(map, getRouteStepParent(map, md)), map)
  }

  const parent_md = toProperNavParent(map, getRouteStepParent(map, md))

  let map_level_num
  if (parent_bwlev) {
    map_level_num = parent_bwlev.getAttr('map_level_num') + 1
  } else {
    if (!isStart(map, md)) {
      throw new Error('can\'t detect map_level_num')
    }
    map_level_num = -1
  }
  // нужно чтобы потом использовать все уровни-предки
  const parent_lev = parent_bwlev
  if (!parent_lev && parent_md) {
    throw new Error('`md.lev` prop dissalowed')
  }

  return createLevel(pvState(parent_lev, 'probe_name'), map_level_num, parent_lev, md, map, Boolean(freeze_parent_bwlev))
}

function getBwlevInParentBwlev(md, map) {
  if (!toProperNavParent(map, getRouteStepParent(map, md))) {
    if (getRel(map, 'mainLevelResident') == md) {
      return getRel(map, 'start_bwlev')
    }

    const item = findByPioneer(getRel(map, 'mainLevelResidents'), md)
    if (item) {
      return item
    }

    throw new Error('root map_parent must be `map.mainLevelResident`')
  }

  const parent_bwlev = getBwlevInParentBwlev(toProperNavParent(map, getRouteStepParent(map, md)), map)
  return getBwlevFromParentBwlev(parent_bwlev, md)
}
