

import getBwlevFromParentBwlev from './getBwlevFromParentBwlev'
import ba_canReuse from './ba_canReuse'
import _goDeeper from './_goDeeper'
import createLevel from './createLevel'
import toProperNavParent from './toProperNavParent'
import getRouteStepParent from './getRouteStepParent'
import isStart from './isStart'
import getBwlevParent from './getBwlevParent'
import getRel from '../provoda/getRel'
import findByPioneer from './findByPioneer'
import updateRel from '../_internal/_updateRel'

const ba_inUse = ba_canReuse.ba_inUse


function ensureStartBwlev(map, md) {

  if (getRel(map, 'mainLevelResident') === md) {
    return getRel(map, 'start_bwlev')
  }

  if (!map.getAttr('works_without_main_resident')) {
    throw new Error('perspectivator should have works_without_main_resident to work without main resident')
  }

  /* for works_without_main_resident */

  const list = getRel(map, 'mainLevelResidents')
  const item = findByPioneer(list, md)
  if (item) {
    return item
  }

  const created = createLevel(
    map.spyglass_name,
    -1,
    false,
    md,
    map
  )

  updateRel(map, 'mainLevelResidents', list ? [...list, created] : [created])
  return created
}

export default function showMOnMap(map, model, bwlev) {

  const is_start = isStart(map, model)

  if (is_start) {
    bwlev = ensureStartBwlev(map, model)
  }

  let bwlev_parent = false

  if (!is_start && (!bwlev || !ba_inUse(bwlev))) {
    // если модель не прикреплена к карте,
    // то прежде чем что-то делать - находим и отображаем "родительску" модель
    let parent_md
    if (bwlev) {
      parent_md = getBwlevParent(bwlev).getNesting('pioneer')
    } else {
      parent_md = getRouteStepParent(map, model)
    }

    parent_md = toProperNavParent(map, parent_md)

    bwlev_parent = showMOnMap(map, parent_md, getBwlevParent(bwlev), true)
  }

  let result = null

  if (bwlev_parent || bwlev_parent === false) {

    if (bwlev_parent) {
      if (!bwlev) {
        bwlev = getBwlevFromParentBwlev(bwlev_parent, model)
      }
    }

    if (ba_canReuse(bwlev) || is_start) {//если модель прикреплена к карте
      result = bwlev
    } else {
      if (!model.model_name) {
        throw new Error('model must have model_name prop')
      }
      // this.bindMMapStateChanges(model, model.model_name);
      result = _goDeeper(map, model, getBwlevParent(bwlev))
    }
  }

  return result
  //
}
