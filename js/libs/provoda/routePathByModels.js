
import spv from '../spv'
import allStates from './dcl/routes/allStates'
import getModernPage from './dcl/routes/getByName'
import createModern, { selectModern } from './dcl/routes/createModern'

const getSPI = getterSPI()
const getSPIConstr = getterSPIConstr()
const MARKED_REMOVED = Symbol()

const routePathByModels = function routePathByModels(start_md, pth_string, need_constr, strict, options, extra_states) {

  if (!pth_string) {
    throw new Error('Empty path can\'t be used. Use / to get start page')
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
    const types = spv.getTargetField(cur_md, '_sub_pager.type')
    if (types && types[pth[i]]) {
      if (!tree_parts_group) {
        tree_parts_group = []
      }
      tree_parts_group.push(pth[i])
      continue
    }

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

function slash(str) {
  return str.split('/')
}

function subPageType(type_obj, parts) {
  const target = type_obj[decodeURIComponent(parts[0])]
  if (typeof target !== 'function') {
    return target || null
  }

  return target(parts[1])
}

function selectRouteItem(self, sp_name) {
  if (self._sub_pages && self._sub_pages[sp_name]) {
    return self._sub_pages[sp_name]
  }

  const sub_pager = self._sub_pager
  if (sub_pager) {
    if (sub_pager.item) {
      return sub_pager.item
    } else {
      const types = sub_pager.by_type
      const type = subPageType(sub_pager.type, slash(sp_name))
      if (type && !types[type]) {
        throw new Error('unexpected type: ' + type + ', expecting: ' + Object.keys(type))
      }
      if (type) {
        return sub_pager.by_type[type]
      }
    }
  }

  if (self.subPager) {
    console.warn('`subPager` is legacy. (there is no proper way to get `constr`, only `instance`). so get rid of `subPager`')
  }
}

const findModern = (self, sp_name, options) => {
  if (self.__routes_matchers_defs == null) {
    return
  }

  const autocreate = !options || options.autocreate !== false

  const item = getModernPage(self, sp_name)
  if (item != null) {
    return item
  }

  const created = autocreate && createModern(self, sp_name)
  if (created) {
    watchModelDie(self, created)
    return created
  }
}

function getterSPI() {
  const init = function(parent, target, data) {
    if (target.hasOwnProperty('_provoda_id')) {
      return target
    }
    parent.useMotivator(target, function(instance) {
      instance.init(parent.getSiOpts(), data)
    })
    return target
  }

  const prepare = function(self, item, sp_name, slashed, extra_states) {
    const Constr = self._all_chi[item.key]
    /*

    берем данные из родителя
    накладываем стандартные данные
    накладываем данные из урла
    */

    const byType = item.byType

    const normal_part = byType ? slashed.slice(1) : slashed
    const by_colon = normal_part[0].split(':').map(decodeURIComponent)
    const by_comma = normal_part[0].split(',').map(decodeURIComponent)
    const by_slash = normal_part.map(decodeURIComponent)

    const states = {
      url_part: '/' + sp_name
    }

    const hbu_data = {
      simple_name: sp_name,
      decoded_name: decodeURIComponent(sp_name),
      name_spaced: by_colon[1],
      by_comma: by_comma,
      by_colon: by_colon,
      by_slash: by_slash,
    }

    const hbu_declr = item.getHead
    const morph_helpers = self.app.morph_helpers

    const head_by_urlname = hbu_declr && hbu_declr(hbu_data, null, morph_helpers)

    if (!Constr.prototype.handling_v2_init) {
      throw new Error('handling_v2_init = false')
    }

    return self.initSi(Constr, {
      by: 'routePathByModels',
      init_version: 2,
      attrs: allStates(states, extra_states),
      head: head_by_urlname,
      url_params: hbu_data,
    })
  }

  return function getSPI(self, sp_name, options, extra_states) {
    const autocreate = !options || options.autocreate !== false
    const reuse = options && options.reuse

    const modern = findModern(self, sp_name, options)
    if (modern) {
      return modern
    }

    const item = selectRouteItem(self, sp_name)
    if (item != null) {
      const can_be_reusable = item.can_be_reusable
      if (reuse && can_be_reusable && self._last_subpages[item.key]) {
        const instance = self._last_subpages[item.key]
        if (instance.state('$$reusable_url')) {
          return instance
        }
      }

      const getKey = item.getKey
      const key = getKey ? getKey(decodeURIComponent(sp_name), sp_name) : sp_name

      if (self.sub_pages && self.sub_pages[key]) {
        if (self.sub_pages[key] === MARKED_REMOVED) {
          return null
        }
        return self.sub_pages[key]
      }

      if (!autocreate) {
        return null
      }

      const instance = item && prepare(self, item, sp_name, slash(sp_name), extra_states)
      if (instance) {
        watchModelDie(self, instance)
        watchSubPageKey(self, instance, key)
        self.sub_pages[key] = instance
        if (can_be_reusable) {
          self._last_subpages[item.key] = instance
        }
        return instance
      }
    }

    if (self.subPager != null) {
      if (self.sub_pages[sp_name]) {
        return self.sub_pages[sp_name]
      }

      if (!autocreate) {
        return null
      }

      const sub_page = self.subPager(decodeURIComponent(sp_name), sp_name)
      const instance = Array.isArray(sub_page)
        ? init(self, sub_page[0], sub_page[1])
        : sub_page

      self.sub_pages[sp_name] = instance
      watchModelDie(self, instance)
      watchSubPageKey(self, instance, sp_name)
      return instance

    }
  }
}

function getterSPIConstr() {
  return function(self, sp_name) {
    const modern = selectModern(self, sp_name)
    if (modern) {
      return modern.Constr
    }

    const item = selectRouteItem(self, sp_name)
    if (item) {
      return self._all_chi[item.key]
    }

    if (self.subPager) {
      const result = self.getSPC(decodeURIComponent(sp_name), sp_name)
      if (Array.isArray(result)) {
        return result[0]
      } else {
        return result
      }
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

function watchSubPageKey(self, instance, key) {
  if (!instance.hasComplexStateFn('url_part')) {
    return
  }

  let cur_key = key

  self.lwch(instance, 'url_part', function(value) {
    if (self.sub_pages[cur_key] === instance) {
      self.sub_pages[cur_key] = null
    }
    self.sub_pages[value] = instance
    cur_key = value
  })

}

routePathByModels.getSPI = getSPI
routePathByModels.getSPIConstr = getSPIConstr
export default routePathByModels
