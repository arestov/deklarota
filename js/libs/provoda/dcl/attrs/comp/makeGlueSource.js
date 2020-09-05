import asString from '../../../utils/multiPath/asString'
import createUpdatedAddr from '../../../utils/multiPath/createUpdatedAddr'
import zip_fns from '../../../utils/zip/multipath-as-dep'

import CompxAttrDecl from './item'


import glueTargets from './glueTargets'
import isGlueTargetAttr from './isGlueTargetAttr'

var zip_of_rel = glueTargets.zip_of_rel
var zip_of_attr = glueTargets.zip_of_attr

function makeGlueSource(addr) {
  var glue_target_type = isGlueTargetAttr(addr)
  if (glue_target_type == null) {
    return null
  }

  switch (glue_target_type) {
    case zip_of_rel: {
      var source_addr = createUpdatedAddr(addr, 'zip_name', 'all')
      return new CompxAttrDecl(asString(addr), [[asString(source_addr)], zip_fns[addr.zip_name]])
    }
    case zip_of_attr: {
      var source_addr = createUpdatedAddr(addr, 'zip_name', 'all')
      return new CompxAttrDecl(asString(addr), [[asString(source_addr)], zip_fns[addr.zip_name]])
    }
    default: {
      throw new Error('unknown type')
    }

  }
}

export default makeGlueSource
