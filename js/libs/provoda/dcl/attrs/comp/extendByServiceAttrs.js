import memorize from '../../../../spv/memorize'
import asString from '../../../utils/multiPath/asString'
import assignField from '../../assignField'

import makeGlueSource from './makeGlueSource'

const makeGlueSourceCachedModel = memorize(makeGlueSource, function(addr) {
  return asString(addr)
})

const makeGlueSourceCachedView = memorize(makeGlueSource, function(addr) {
  return asString(addr)
})

const make = (addr, isView) => {
  if (!isView) {
    return makeGlueSourceCachedModel(addr)
  }

  return makeGlueSourceCachedView(addr, isView)
}

function makeAllGlueSources(mut_result, comp_item, isView) {
  for (let i = 0; i < comp_item.addrs.length; i++) {
    const item_to_add = make(comp_item.addrs[i], isView)
    if (item_to_add == null) {
      continue
    }
    mut_result.push(item_to_add)
    makeAllGlueSources(mut_result, item_to_add, isView)
  }
}

const extendByServiceAttrs = function(self, comps) {
  const result_list = []
  const result = {}

  for (const prop in comps) {
    if (!comps.hasOwnProperty(prop)) {
      continue
    }
    const cur = comps[prop]

    for (let i = 0; i < cur.addrs.length; i++) {
      makeAllGlueSources(result_list, cur, self.__isView)
    }
  }

  for (let i = 0; i < result_list.length; i++) {
    const cur = result_list[i]
    result[cur.name] = cur
  }

  assignField(self, '__dcls_comp_attrs_glue', result)
}


export const clearCache = () => {
  makeGlueSourceCachedModel.__clear()
}

export default extendByServiceAttrs
