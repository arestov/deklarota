

import _updateRel from './_internal/_updateRel'
import pathExecutor from './routes/legacy/stringify'
import getSPByPathTemplate from './routes/legacy/getSPByPathTemplate'

//если есть состояние для предзагрузки
//если изменилось гнездование

const getSubPByDeclr = function(md, cur) {
  if (cur.type == 'route') {
    return getSPByPathTemplate(md.app, md, cur.value)
  } else {
    const constr = md._all_chi[cur.key]
    return md.initSi(constr)
  }
}

const getSubPByDeclrStrict = (md, cur) => {
  const result = getSubPByDeclr(md, cur)
  if (result == null) {
    console.log(cur, md.__code_path)
    throw new Error('should not be empty')
  }

  return result
}

const getSubpages = function(md, el) {
  const array = el.subpages_names_list
  let result
  if (Array.isArray(array)) {
    result = new Array(array)
    for (let i = 0; i < array.length; i++) {
      result[i] = getSubPByDeclrStrict(md, array[i])
    }
  } else {
    result = getSubPByDeclrStrict(md, array)
  }
  return result
}

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
      _updateRel(md, el.nesting_name, getSubpages(md, el))
    }
    return
  }

  const init_func = function(state) {
    if (!state) {
      return
    }

    if (!this.getNesting(el.nesting_name)) {
      _updateRel(this, el.nesting_name, getSubpages(this, el))
    }

    md.removeLwch(md, el.idle_until, init_func)
  }

  md.lwch(md, el.idle_until, init_func)

}

const initDeclaredNestings = function(md) {
  for (let i = 0; i < md.nestings_declarations.length; i++) {
    initOneDeclaredNesting(md, md.nestings_declarations[i])
  }
}

initDeclaredNestings.getSubpages = getSubpages
initDeclaredNestings.pathExecutor = pathExecutor


initDeclaredNestings.getConstrByPath = function(app, md, string_template) {
  return getSPByPathTemplate(app, md, string_template, true)
}

export default initDeclaredNestings
