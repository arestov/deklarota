import glueTargets from './glueTargets'
import isNestingAddr from './isNestingAddr'

var hasGlueSourceAttr = function(addr) {
  if ((addr.zip_name != null && addr.zip_name != 'all') && isNestingAddr(addr)) {
    if (addr.result_type === 'nesting') {
      return glueTargets.zip_of_rel
    }

    if (addr.result_type === 'state') {
      return glueTargets.zip_of_attr
    }
  }

  if (addr.result_type == 'state' && addr.state.base != addr.state.path) {
    if (isNestingAddr(addr)) {
      return glueTargets.long_attr_of_rel
    }

    return glueTargets.long_attr_of_attr
  }


}

export default hasGlueSourceAttr
