import glueTargets from './glueTargets'
import isNestingAddr from './isNestingAddr'

var hasGlueSourceAttr = function(addr) {
  if ((addr.zip_name != null && addr.zip_name != 'all') && isNestingAddr(addr)) {
    if (addr.result_type === 'nesting') {
      return glueTargets.zip_of_rel
    }
  }

}

export default hasGlueSourceAttr
