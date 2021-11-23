
import spv from '../../spv'
import selecPoineertDeclr from './selecPoineertDeclr'
import get_constr from './get_constr'

const getNestingConstr = get_constr.getNestingConstr

const general_path = 'm_children.children.%replace_by_switch_nesting_name%.main.m_children.children_by_mn.pioneer'.split('.')
// usualy it will be 'm_children.children.map_slice.main.m_children.children_by_mn.pioneer';
const getPath = spv.memorize(function(switch_nesting_name) {
  const pth = general_path.slice()
  pth[2] = switch_nesting_name
  return pth
})

const children_path = 'm_children.children_by_mn.pioneer'

export default function getUsageStruc(md, switch_nesting_name, used_data_structure, app) {
  let struc

  const model_name = md.model_name

  const dclrs_fpckgs = used_data_structure.collch_dclrs
  const dclrs_selectors = used_data_structure.collch_selectors

  const path = getPath(switch_nesting_name)

  const bwlev_dclr = selecPoineertDeclr(dclrs_fpckgs, dclrs_selectors, switch_nesting_name, model_name, 'main', true)
  if (!bwlev_dclr) {
    const default_struc = spv.getTargetField(used_data_structure, path)[ '$default' ]
    return spv.getTargetField(used_data_structure, path)[ model_name ] || default_struc
  }

  const path_mod = 'm_children.children.' + switch_nesting_name + '.' + (bwlev_dclr.space || 'main')
  //+ '.m_children.children_by_mn.pioneer';
  const bwlev_struc = spv.getTargetField(used_data_structure, path_mod)
  const bwlev_dclrs_fpckgs = bwlev_struc.collch_dclrs
  const bwlev_dclrs_selectors = bwlev_struc.collch_selectors

  const pioneer_model_name = bwlev_dclr.is_wrapper_parent ? md.map_parent.model_name : model_name
  const md_dclr = selecPoineertDeclr(bwlev_dclrs_fpckgs, bwlev_dclrs_selectors, 'pioneer', pioneer_model_name, (bwlev_dclr.space || 'main'), true)

  const children = spv.getTargetField(bwlev_struc, children_path)

  struc = spv.getTargetField(children, [pioneer_model_name, md_dclr.space]) || spv.getTargetField(children, ['$default', md_dclr.space])

  if (!bwlev_dclr.is_wrapper_parent) {
    return struc
  }

  const nestings = struc.m_children.children
  const Constr = md.constructor
  for (const nesting_name in nestings) {
    const items = getNestingConstr(app, md.map_parent, nesting_name)
    if (items) {
      if (Array.isArray(items)) {
        if (items.indexOf(Constr) != -1) {
          struc = nestings[nesting_name]
          break
        }
      } else {
        if (items == Constr) {
          struc = nestings[nesting_name]
          break
        }
      }
    }
  }
  return struc
}
