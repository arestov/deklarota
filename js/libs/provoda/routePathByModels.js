
import getModernPage from './dcl/routes/getByName'
import createModern, { getRouteConstr, selectModern } from './dcl/routes/createModern'
import { toBasicTemplate } from './routes/parse'

const getSPI = getterSPI()
const getSPIConstr = getterSPIConstr()
const MARKED_REMOVED = Symbol()

const getModernConstr = (start_md, pth_string) => {
  const route_template = pth_string
  const basic_route_template = toBasicTemplate(route_template)

  const dcl = start_md._extendable_routes_index?.[basic_route_template]
  if (!dcl) {
    return
  }

  return getRouteConstr(start_md, dcl)
}

const routePathByModels = function routePathByModels(start_md, pth_string, need_constr, strict, options, extra_states) {

  if (!pth_string) {
    throw new Error('Empty path can\'t be used. Use / to get start page')
  }

  if (need_constr) {
    const Constr = getModernConstr(start_md, pth_string)

    if (Constr) {
      return Constr
    }
  } else {
    const modern = findModern(start_md, pth_string)
    if (modern) {
      return modern
    }
  }

  /*
  catalog
  users
  tags
  */


  /*
  #/catalog/The+Killers/_/Try me
  #?q=be/tags/beautiful
  #/catalog/Varios+Artist/Eternal+Sunshine+of+the+spotless+mind/Phone+Call
  #/catalog/Varios+Artist/Eternal+Sunshine+of+the+spotless+mind/Beastie+boys/Phone+Call
  #/catalog/The+Killers/+similar/Beastie+boys/Phone+Call
  #/recommendations/Beastie+boys/Phone+Call
  #/loved/Beastie+boys/Phone+Call
  #/radio/artist/The+Killers/similarartist/Bestie+Boys/Intergalactic
  #?q=be/directsearch/vk/345345
  #/ds/vk/25325_2344446
  http://www.lastfm.ru/music/65daysofstatic/+similar
  */
  const cleanPath = pth_string.replace(/^\//, '').replace(/([^\/])\+/g, '$1 ')/*.replace(/^\//,'')*/
  if (!cleanPath) {
    return start_md
  }
  const pth = cleanPath.split('/')

  let cur_md = start_md
  let result = null
  let tree_parts_group = null
  for (let i = 0; i < pth.length; i++) {
    let path_full_string
    if (tree_parts_group) {
      const full = tree_parts_group.slice(0)
      full.push(pth[i])
      path_full_string = full.join('/')
    } else {
      path_full_string = pth[i]
    }
    tree_parts_group = null

    if (need_constr) {
      const Constr = getSPIConstr(cur_md, path_full_string)
      if (!Constr) {
        throw new Error('you must use supported path')
      } else {
        cur_md = Constr.prototype
        result = Constr
      }
      continue
    }

    const md = getSPI(cur_md, path_full_string, options, extra_states)
    if (md) {
      cur_md = md
      result = md
    } else if (strict) {
      return null
    } else {
      break
    }
  }

  return result
}


function findModern(self, sp_name, options, extra_states) {
  if (self.__routes_matchers_defs == null) {
    return
  }

  const autocreate = !options || options.autocreate !== false

  const item = getModernPage(self, sp_name)
  if (item != null) {
    return item
  }

  const created = autocreate && createModern(self, sp_name, extra_states)
  if (created) {
    watchModelDie(self, created)
    return created
  }
}

function getterSPI() {
  return function getSPI(self, sp_name, options, extra_states) {
    const modern = findModern(self, sp_name, options, extra_states)
    if (modern) {
      return modern
    }
  }
}

function getterSPIConstr() {
  return function(self, sp_name) {
    const modern = selectModern(self, sp_name)
    if (modern) {
      return modern.Constr
    }

  }
}

function watchModelDie(self, instance) {
  let sub_pages = self.sub_pages
  instance.onDie(function() {
    if (sub_pages == null) {
      return
    }

    for (const key in sub_pages) {
      if (!sub_pages.hasOwnProperty(key)) {
        continue
      }

      const cur = sub_pages[key]
      if (cur !== instance) {
        continue
      }

      sub_pages[key] = MARKED_REMOVED
    }

    sub_pages = null
  })
}

routePathByModels.getSPI = getSPI
export default routePathByModels
