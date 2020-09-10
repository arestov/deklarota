import spv from '../../../../spv'
import asString from '../../../utils/multiPath/asString'
import createUpdatedAddr from '../../../utils/multiPath/createUpdatedAddr'
import zip_fns from '../../../utils/zip/multipath-as-dep'

import CompxAttrDecl from './item'

import isJustAttrAddr from './isJustAttrAddr'

import glueTargets from './glueTargets'
import isGlueTargetAttr from './isGlueTargetAttr'


var zip_of_rel = glueTargets.zip_of_rel
var zip_of_attr = glueTargets.zip_of_attr
var long_attr_of_attr = glueTargets.long_attr_of_attr
var long_attr_of_rel = glueTargets.long_attr_of_rel


var getTreeGetter = function(val) {
  var tree = spv.splitByDot(val).slice(1)
  return function(val) {
    if (val == null) {
      return
    }
    return spv.getTargetField(val, tree)
  }
}

function makeGlueSource(addr) {
  var glue_target_type = isGlueTargetAttr(addr)
  if (glue_target_type == null) {
    return null
  }

  var target_key = asString(addr)

  switch (glue_target_type) {
    case zip_of_rel: {
      var source_addr = createUpdatedAddr(addr, 'zip_name', 'all')
      return new CompxAttrDecl(target_key, [[asString(source_addr)], zip_fns[addr.zip_name]])
    }
    case zip_of_attr: {
      var source_addr = createUpdatedAddr(addr, 'zip_name', 'all')
      return new CompxAttrDecl(target_key, [[asString(source_addr)], zip_fns[addr.zip_name]])
    }

    case long_attr_of_rel: {
      var source_addr = createUpdatedAddr(addr, 'state', addr.state.base)
      var getValue = getTreeGetter(addr.state.path)
      var fn = function(list) {
        return list && list.map(getValue)
      }
      return new CompxAttrDecl(target_key, [[asString(source_addr)], fn])
    }
    case long_attr_of_attr: {
      var getValue = getTreeGetter(addr.state.path)
      if (isJustAttrAddr(addr)) {
        return new CompxAttrDecl(addr.state.path, [[addr.state.base], getValue])
      }

      var source_addr = createUpdatedAddr(addr, 'state', addr.state.base)
      return new CompxAttrDecl(target_key, [[asString(source_addr)], getValue])
    }

    default: {
      throw new Error('unknown type')
    }

  }
}

export default makeGlueSource
