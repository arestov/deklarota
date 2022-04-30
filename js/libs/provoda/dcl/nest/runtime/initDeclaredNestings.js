

import _updateRel from '../../../_internal/_updateRel'
import pathExecutor from '../../../routes/legacy/stringify'
import getSPByPathTemplate from '../../../routes/legacy/getSPByPathTemplate'
import initRelByDcl from './initRelByDcl'

//если есть состояние для предзагрузки
//если изменилось гнездование


const initOneDeclaredNesting = function(md, el) {
  /*
  nesting_name
  subpages_names_list
  idle_until


  subpages_names_list: ...cur[0]...,
  idle_until: cur[2]
  */


  if (!el.idle_until) {
    if (!md.getNesting(el.nesting_name)) {
      _updateRel(md, el.nesting_name, initRelByDcl(md, el))
    }
    return
  }
}

const initDeclaredNestings = function(md) {
  for (let i = 0; i < md.nestings_declarations.length; i++) {
    initOneDeclaredNesting(md, md.nestings_declarations[i])
  }
}

export { pathExecutor }


export const getConstrByPath = function(app, md, string_template) {
  return getSPByPathTemplate(app, md, string_template, true)
}

export default initDeclaredNestings
