

import hp from '../../helpers'
import initDeclaredNestings from '../../initDeclaredNestings'
var getSubpages = initDeclaredNestings.getSubpages

export default function loadNestingsByStruc(md, struc) {
  if (!struc) {return}

  var idx = md.idx_nestings_declarations
  if (!idx) {return}

  var obj = struc.main.m_children.children
  for (var name in obj) {
    var nesting_name = hp.getRightNestingName(md, name)
    var el = idx[nesting_name]
    if (!el) {continue}

    var item = getSubpages(md, el)
    if (Array.isArray(item) || !item.preloadStart) {
      continue
    }
    if (item.hasComplexStateFn('preview_list') || item.hasComplexStateFn('preview_loading')) {
      continue
    }
    item.preloadStart()
  }
}
