

import hp from '../../helpers'
import _updateRel from '../../_internal/_updateRel'
import initDeclaredNestings from '../../initDeclaredNestings'
const getSubpages = initDeclaredNestings.getSubpages

export default function initNestingsByStruc(md, struc) {
  if (!struc) {return}

  const idx = md.idx_nestings_declarations
  if (!idx) {return}

  const obj = struc.main.m_children.children
  for (const name in obj) {
    const nesting_name = hp.getRightNestingName(md, name)
    const el = idx[nesting_name]
    if (!el) {continue}
    if (el.init_state_name && (el.init_state_name !== 'mp_show' && el.init_state_name !== 'mp_has_focus')) {
      continue
    }
    if (md.getNesting(el.nesting_name)) {
      continue
    }
    _updateRel(md, el.nesting_name, getSubpages(md, el))
  }
}
