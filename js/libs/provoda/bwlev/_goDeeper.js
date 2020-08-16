
import pvState from '../utils/state'
import createLevel from './createLevel'
import getBwlevFromParentBwlev from './getBwlevFromParentBwlev'
import toProperNavParent from './toProperNavParent'

export default function _goDeeper(BWL, map, md, parent_bwlev) {
  // без parent_bwlev нет контекста
  if (!parent_bwlev) {
    // будем искать parent_bwlev на основе прямой потомственности от уровня -1
    parent_bwlev = getBwlevInParentBwlev(toProperNavParent(md.map_parent), map)
  }

  var parent_md = toProperNavParent(md.map_parent)

  var map_level_num
  if (parent_bwlev) {
    map_level_num = parent_bwlev.state('map_level_num') + 1
  } else {
    if (typeof md.map_level_num != 'number') {
      throw new Error('md must have `map_level_num`')
    }
    map_level_num = md.map_level_num
  }
  // нужно чтобы потом использовать все уровни-предки
  var parent_lev = parent_bwlev
  if (!parent_lev && parent_md) {
    throw new Error('`md.lev` prop dissalowed')
  }

  return createLevel(BWL, pvState(parent_lev, 'probe_name'), map_level_num, parent_lev, md, map)
}

function getBwlevInParentBwlev(md, map) {
  if (!toProperNavParent(md.map_parent)) {
    if (map.mainLevelResident == md) {
      return map.start_bwlev
    }

    if (map.mainLevelResidents && map.mainLevelResidents[md._provoda_id]) {
      return map.mainLevelResidents[md._provoda_id]
    }

    throw new Error('root map_parent must be `map.mainLevelResident`')
  }

  var parent_bwlev = getBwlevInParentBwlev(toProperNavParent(md.map_parent), map)
  return getBwlevFromParentBwlev(parent_bwlev, md)
}
