import spv from '../../../../spv'
import asString from '../../../utils/multiPath/asString'
import createUpdatedAddr from '../../../utils/multiPath/createUpdatedAddr'
import zip_fns from '../../../utils/zip/multipath-as-dep'

import CompxAttrDecl from './item'

import isJustAttrAddr from '../../../utils/multiPath/isJustAttrAddr'

import glueTargets from './glueTargets'
import isGlueTargetAttr from './isGlueTargetAttr'


const zip_of_rel = glueTargets.zip_of_rel
const zip_of_attr = glueTargets.zip_of_attr
const long_attr_of_attr = glueTargets.long_attr_of_attr
const long_attr_of_rel = glueTargets.long_attr_of_rel
const rel_of_ascendor = glueTargets.rel_of_ascendor


const getTreeGetter = function(val) {
  const tree = spv.splitByDot(val).slice(1)
  return function(val) {
    if (val == null) {
      return
    }
    return spv.getTargetField(val, tree)
  }
}

function makeGlueSource(addr, isView) {
  const glue_target_type = isGlueTargetAttr(addr, isView)
  if (glue_target_type == null) {
    return null
  }

  const target_key = asString(addr)

  switch (glue_target_type) {
    case zip_of_rel: {
      const source_addr = createUpdatedAddr(addr, {zip_name: 'all'})
      return new CompxAttrDecl(target_key, [[asString(source_addr)], zip_fns[addr.zip_name]])
    }
    case zip_of_attr: {
      const source_addr = createUpdatedAddr(addr, {zip_name: 'all'})
      return new CompxAttrDecl(target_key, [[asString(source_addr)], zip_fns[addr.zip_name]])
    }

    case long_attr_of_rel: {
      const source_addr = createUpdatedAddr(addr, {state: addr.state.base})
      const getValue = getTreeGetter(addr.state.path)
      const fn = function(list) {
        return list && list.map(getValue)
      }
      return new CompxAttrDecl(target_key, [[asString(source_addr)], fn])
    }
    case long_attr_of_attr: {
      const getValue = getTreeGetter(addr.state.path)
      if (isJustAttrAddr(addr)) {
        return new CompxAttrDecl(addr.state.path, [[addr.state.base], getValue])
      }

      const source_addr = createUpdatedAddr(addr, {state: addr.state.base})
      return new CompxAttrDecl(target_key, [[asString(source_addr)], getValue])
    }

    case rel_of_ascendor: {
      throw new Error('cant handle that')
    }

    default: {
      throw new Error('unknown type')
    }

  }
}

export default makeGlueSource
