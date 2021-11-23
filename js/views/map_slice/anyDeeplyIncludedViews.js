
import getModelFromR from '../../libs/provoda/provoda/v/getModelFromR'
import getNesting from '../../libs/provoda/provoda/getNesting'

const matchParent = function(possible_parent, child) {
  let cur = child
  while (cur.parent_view) {
    if (cur.parent_view == possible_parent) {
      return true
    }

    cur = cur.parent_view
  }

  return false
}

export default function(spyglass_view, current_bwlev_mdr, target_bwlev_mdr) {
  // look if any views of md if deeply included in target_root
  // to do this we will check if one of parent_view.parent_view[...] of mpx views is target_root
  const current_bwlev = current_bwlev_mdr && getModelFromR(spyglass_view, current_bwlev_mdr)
  if (!current_bwlev) {
    return null
  }

  const cur_md = getNesting(current_bwlev, 'pioneer')
  const bwlev_view = spyglass_view.getMapSliceView(current_bwlev, cur_md)

  const target_bwlev = getModelFromR(spyglass_view, target_bwlev_mdr)
  const target_md = getNesting(target_bwlev, 'pioneer')

  const views = spyglass_view.getStoredMpx(target_md).getViews()
  if (!views) {
    return null
  }
  for (let i = 0; i < views.length; i++) {
    const cur = views[i]
    if (matchParent(bwlev_view, cur)) {
      return cur
    }

  }
}
