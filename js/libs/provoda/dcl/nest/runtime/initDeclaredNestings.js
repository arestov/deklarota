

import _updateRel from '../../../_internal/_updateRel'
import pathExecutor from '../../../routes/legacy/stringify'
import getSPByPathTemplate from '../../../routes/legacy/getSPByPathTemplate'
import initRelByDcl from './initRelByDcl'
import { nestingMark } from '../../effects/legacy/nest_req/nestingMark'
import _updateAttr from '../../../_internal/_updateAttr'

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
  if (el.idle_until) {
    return
  }

  const inited_mark = nestingMark(el.nesting_name, 'autoinited')
  if (md.getAttr(inited_mark)) {
    return
  }

  if (md.getNesting(el.nesting_name)) {
    return
  }

  _updateRel(md, el.nesting_name, initRelByDcl(md, el))
  _updateAttr(md, inited_mark, true)
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
