import memorize from '../../../../spv/memorize'
import asString from '../../../utils/multiPath/asString'

import makeGlueSource from './makeGlueSource'

var makeGlueSourceCached = memorize(makeGlueSource, function(addr) {
  return asString(addr)
})

function makeAllGlueSources(mut_result, comp_item) {
  for (var i = 0; i < comp_item.addrs.length; i++) {
    var item_to_add = makeGlueSourceCached(comp_item.addrs[i])
    if (item_to_add == null) {
      continue
    }
    mut_result.push(item_to_add)
    makeAllGlueSources(mut_result, item_to_add)
  }
}

const extendByServiceAttrs = function(self, props, typed_state_dcls) {
  var comps = typed_state_dcls['comp']

  var result = []

  for (var prop in comps) {
    if (!comps.hasOwnProperty(prop)) {
      continue
    }
    var cur = comps[prop]

    for (var i = 0; i < cur.addrs.length; i++) {
      makeAllGlueSources(result, cur)
    }
  }

  for (var i = 0; i < result.length; i++) {
    var cur = result[i]
    comps[cur.name] = cur
  }
}

export default extendByServiceAttrs
