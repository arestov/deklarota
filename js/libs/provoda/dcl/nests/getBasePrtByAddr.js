import routePathByModels from '../../routePathByModels'

const getAddrBasePrt = (prt, from_base) => {
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
      throw new Error('unknown type ' + from_base.type)
    }
  }
}


const getBasePrtByAddr = (prt, addr) => {
  const base = getAddrBasePrt(prt, addr.from_base)

  if (!addr.resource.path) {
    return base
  }

  const constr = routePathByModels(base, addr.resource.path, true)


  return constr && constr.prototype
}

export default getBasePrtByAddr
