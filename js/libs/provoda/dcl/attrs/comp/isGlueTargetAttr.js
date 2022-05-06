import glueTargets from './glueTargets'
import isRelAddr from '../../../utils/multiPath/isRelAddr'

import isGlueRoot from '../../glue_rels/runtime/isGlueRoot'
import isGlueParent from '../../glue_rels/runtime/isGlueParent'

const isAscending = function(addr) {
  return isGlueRoot(addr) || isGlueParent(addr)
}

const hasGlueSourceAttr = function(addr, isView) {
  if ((addr.zip_name != null && addr.zip_name != 'all') && isRelAddr(addr)) {
    if (isView) {
      // View works on "one" view-rel mode for now. cant work with "many"
      return
    }
    if (addr.result_type === 'nesting') {
      return glueTargets.zip_of_rel
    }

    if (addr.result_type === 'state') {
      return glueTargets.zip_of_attr
    }
  }

  if (addr.result_type == 'state' && addr.state.base != addr.state.path) {
    if (isRelAddr(addr)) {
      return glueTargets.long_attr_of_rel
    }

    return glueTargets.long_attr_of_attr
  }

  if (isRelAddr(addr) && isAscending(addr)) {
    throw new Error('cant handle that')
  }

}

export default hasGlueSourceAttr
