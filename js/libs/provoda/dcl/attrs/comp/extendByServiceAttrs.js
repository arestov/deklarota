import asString from '../../../utils/multiPath/asString'
import createUpdatedAddr from '../../../utils/multiPath/createUpdatedAddr'
import spv from '../../../../spv'
import { doCopy } from '../../../../spv/cloneObj'

import CompxAttrDecl from './item'
import isJustAttrAddr from './isJustAttrAddr'
import isNestingAddr from './isNestingAddr'

var getTreeGetter = function(val) {
  var tree = spv.splitByDot(val).slice(1)
  return function(val) {
    if (val == null) {
      return
    }
    return spv.getTargetField(val, tree)
  }
}

const attrButNotSimple = function(addr) {
  if (addr.result_type != 'state') {
    return null
  }

  if (addr.state.base == addr.state.path) {
    return null
  }

  if (isJustAttrAddr(addr)) {
    return new CompxAttrDecl(addr.state.path, [[addr.state.base], getTreeGetter(addr.state.path)])
  }

  if (isNestingAddr(addr)) {
    // problem with "< @one:__info.options.profile < currentBillingPlan <<". it uses old implementation
    return null
  }

  const path_string = asString(addr)
  const base_addr = createUpdatedAddr(addr, 'state', addr.state.base)

  const base_path_string = asString(base_addr)

  return new CompxAttrDecl(path_string, [[base_path_string], getTreeGetter(addr.state.path)])
}

const extendByServiceAttrs = function(self, props, typed_state_dcls) {
  var comps = typed_state_dcls['comp']

  var result = {}

  for (var prop in comps) {
    if (!comps.hasOwnProperty(prop)) {
      continue
    }
    var cur = comps[prop]

    for (var i = 0; i < cur.addrs.length; i++) {
      var item_to_add = attrButNotSimple(cur.addrs[i])
      if (item_to_add == null) {
        continue
      }
      result[item_to_add.name] = item_to_add
    }
  }

  doCopy(comps, result)

}

export default extendByServiceAttrs
