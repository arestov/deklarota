

import _updateRel from './_internal/_updateRel'
import pathExecutor from './routes/legacy/stringify'
import getSPByPathTemplate from './routes/legacy/getSPByPathTemplate'

const preloadStart = function(md) {
  md.preloadStart()
}

const executePreload = function(md, nesting_name) {
  const lists_list = md.getNesting(nesting_name)

  if (!lists_list) {return}
  if (Array.isArray(lists_list)) {
    for (let i = 0; i < lists_list.length; i++) {
      const cur = lists_list[i]
      if (cur.preloadStart) {
        md.useMotivator(cur, preloadStart)
      }

    }
  } else {
    if (lists_list.preloadStart) {
      md.useMotivator(lists_list, preloadStart)
    }
  }
}


//если есть состояние для предзагрузки
//если изменилось гнездование

const bindPreload = function(md, preload_state_name, nesting_name) {
  md.lwch(md, preload_state_name, function(state) {
    if (state) {
      executePreload(md, nesting_name)
    }
  })
}

const getSubPByDeclr = function(md, cur) {
  if (cur.type == 'route') {
    return getSPByPathTemplate(md.app, md, cur.value)
  } else {
    const constr = md._all_chi[cur.key]
    return md.initSi(constr)
  }
}

const getSubpages = function(md, el) {
  const array = el.subpages_names_list
  let result
  if (Array.isArray(array)) {
    result = new Array(array)
    for (let i = 0; i < array.length; i++) {
      result[i] = getSubPByDeclr(md, array[i])
    }
  } else {
    result = getSubPByDeclr(md, array)
  }
  return result
}

const initOneDeclaredNesting = function(md, el) {
  /*
  nesting_name
  subpages_names_list
  preload
  idle_until


  subpages_names_list: ...cur[0]...,
  preload: cur[1],
  idle_until: cur[2]
  */

  if (el.preload_on) {
    bindPreload(md, el.preload_on, el.nesting_name)
  }


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

    if (el.preload_on && this.state(el.preload_on)) {
      executePreload(this, el.nesting_name)
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
