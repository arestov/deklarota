

import hp from '../../helpers'
import initRelByDcl from '../../dcl/nest/runtime/initRelByDcl'

export default function loadNestingsByStruc(md, struc) {
  if (!struc) {return}

  const idx = md.idx_nestings_declarations
  if (!idx) {return}

  const obj = struc.main.m_children.children
  for (const name in obj) {
    const nesting_name = hp.getRightNestingName(md, name)
    const el = idx[nesting_name]
    if (!el) {continue}

    const item = initRelByDcl(md, el)
    if (Array.isArray(item) || !item.preloadStart) {
      continue
    }
    if (item.hasComplexStateFn('preview_list') || item.hasComplexStateFn('preview_loading')) {
      continue
    }
    item.preloadStart()
  }
}
