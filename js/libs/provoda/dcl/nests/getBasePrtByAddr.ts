import type { ModelProto } from '../../dkt.types'
import routePathByModels from '../../routePathByModels'
import type { Addr, AscendorAddr } from '../../utils/multiPath/addr.types'

const getAddrBasePrt = (prt: ModelProto, from_base: AscendorAddr): ModelProto => {
  if (!from_base || !from_base.type) {
    return prt
  }

  switch (from_base.type) {
    case 'root': {
      return prt.RootConstr.prototype.start_page
    }
    case 'parent': {
      let count = from_base.steps
      let result = prt
      while (count) {
        result = result._parent_constr.prototype
        count = count - 1
      }
      return result
    }
    default: {
      // TODO: legacy error. don't need it when all code be ts
      throw new Error('unknown type ' + (from_base as unknown as AscendorAddr).type)
    }
  }
}


const getBasePrtByAddr = (prt: ModelProto, addr: Addr): ModelProto => {
  const base = getAddrBasePrt(prt, addr.from_base)

  if (!addr.resource.path) {
    return base
  }

  const constr = routePathByModels(base, addr.resource.path, true)


  return constr && constr.prototype
}

export default getBasePrtByAddr
