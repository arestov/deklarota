
import spv, { countKeys } from '../../spv'
import _updateRel from '../_internal/_updateRel'
import _updateAttr from '../_internal/_updateAttr'
import probeDiff from './probeDiff'

const multiBwlevAttr = (multi_attr, final_attr) => (bwlev, value) => {
  /*
    1. update attr (final_attr) in bwlev
    md can be pioneer in multiple bwlevs, so
    2. track multiple bwlevs of md (multi_attr)
    3. update attr (final_attr) in model

    bwlev:final_attr -> md:multi_attr -> md:final_attr
  */
  const md = bwlev.getNesting('pioneer')

  let obj = {...md.state(multi_attr)}

  const key = bwlev._provoda_id

  if (value) {
    obj[key] = value
    obj = obj
  } else {
    delete obj[key]
    obj = obj
  }

  Object.freeze(obj)

  const final_value = Boolean(countKeys(obj))

  _updateAttr(bwlev, final_attr, value)
  _updateAttr(md, multi_attr, final_value ? obj : undefined)
  _updateAttr(md, final_attr, final_value)
}

const multiShow = multiBwlevAttr('$meta$perspective$each_show', 'mp_show')
const multiFocus = multiBwlevAttr('$meta$perspective$each_focus', 'mp_has_focus')


const handleMoveView = (change) => {
  multiShow(change.bwlev, change.value)
}

const travebasingRemove = (change) => {
  multiShow(change.bwlev, false)
}

const travebasingUpdate = (change) => {
  multiShow(change.bwlev, true)
}

const travebasingAdd = (change) => {
  multiShow(change.bwlev, true)
}

const handleChange = (_perspectivator, change) => {
  switch (change.type) {
    case 'move-view': {
      handleMoveView(change)
      return
    }
    case 'travebasing-remove': {
      travebasingRemove(change)
      return
    }
    case 'travebasing-update': {
      travebasingUpdate(change)
      return
    }
    case 'travebasing-add': {
      travebasingAdd(change)
      return
    }
    default: {
      throw new Error('unknown change type: ' + change.type)
    }
  }
}

const updateDistance = (next_tree, prev_tree) => {
  const prev = new Set(prev_tree)
  for (let i = 0; i < next_tree.length; i++) {
    prev.delete(next_tree[i])
  }

  for (const cur of prev) {
    _updateAttr(cur, 'distance_from_destination', null)
  }

  for (let i = next_tree.length - 1; i >= 0; i--) {
    const cur = next_tree[i]
    _updateAttr(cur, 'distance_from_destination', i - (next_tree.length - 1))
  }
}

const updateFocus = (next_tree, prev_tree) => {
  const destination = next_tree && next_tree[next_tree.length - 1]

  const everything = new Set([
    ...(next_tree || []),
    ...(prev_tree || [])
  ])

  // everything except destination
  everything.delete(destination)

  // everything except destination should not have focus
  for (const item of everything) {
    multiFocus(item, false)
  }

  if (destination) {
    multiFocus(destination, true)
  }
}

function animateMapChanges(fake_spyglass, next_tree, prev_tree) {
  const diff = probeDiff(next_tree, prev_tree)

  if (!diff.array || !diff.array.length) {
    return
  }

  const bwlevs = next_tree

  _updateRel(fake_spyglass, 'navigation', bwlevs)

  const changes = diff
  let i
  let all_changhes = spv.filter(changes.array, 'changes')


  all_changhes = Array.prototype.concat.apply(Array.prototype, all_changhes)
 //var models = spv.filter(all_changhes, 'target');

  for (i = 0; i < all_changhes.length; i++) {
    const change = all_changhes[i]
    handleChange(fake_spyglass, change)
  }

 /*
   подсветить/заменить текущий источник
   проскроллить к источнику при отдалении
   просроллить к источнику при приближении
 */

 // var bwlevs = residents && spv.filter(residents, 'lev.bwlev');

  const model = diff.bwlev?.getNesting('pioneer')
  if (model) {
    const target_md = model

    updateDistance(next_tree, prev_tree)
    updateFocus(next_tree, prev_tree)

   // _updateAttr(fake_spyglass, 'show_search_form', !!target_md.state('needs_search_from'));
    _updateAttr(fake_spyglass, 'full_page_need', diff.bwlev.getAttr('full_page_need'))

    _updateRel(fake_spyglass, 'current_mp_md', target_md)
    _updateRel(fake_spyglass, 'current_mp_bwlev', diff.bwlev)
   //_updateAttr(target_md, 'mp-highlight', false);


  }

  _updateRel(fake_spyglass, 'map_slice', next_tree)

}

function changeZoomSimple(bwlev, value_raw) {
  const value = Boolean(value_raw)
  _updateAttr(bwlev, 'mp_show', value)
  multiShow(bwlev, value)
}

export const switchCurrentBwlev = (bwlev, prev) => {
  if (prev) {
    changeZoomSimple(prev, false)
  }
  if (bwlev) {
    changeZoomSimple(bwlev, true)
  }

  updateDistance([bwlev], [prev])
}

export default animateMapChanges
