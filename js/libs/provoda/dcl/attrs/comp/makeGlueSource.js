import asString from '../../../utils/multiPath/asString'
import createUpdatedAddr from '../../../utils/multiPath/createUpdatedAddr'
import zip_fns from '../../../utils/zip/multipath-as-dep'

import CompxAttrDecl from './item'


import glueTargets from './glueTargets'

var zip_of_rel = glueTargets.zip_of_rel

function makeGlueSource(addr, target) {
  switch (target) {
    case zip_of_rel: {
      var source_addr = createUpdatedAddr(addr, 'zip_name', 'all')
      return new CompxAttrDecl(asString(addr), [[asString(source_addr)], zip_fns[addr.zip_name]])
    }
    default: {
      return null
    }

  }
}

export default makeGlueSource
