import getBasePrtByAddr from './getBasePrtByAddr'

const recurGetConstrByRelLinking = (getAddrRelConstr) => {

  const oneItem = (prt, linking_item) => {
    if (linking_item.type == 'constr') {
      return prt._all_chi[linking_item.value]
    }

    if (linking_item.type != 'addr') {
      throw new Error('unknown type')
    }

    const addr = linking_item.value
    if (addr.base_itself) {
      return prt.constructor
    }

    var base = getBasePrtByAddr(prt, addr)

    if (!addr.nesting.path) {
      return base.constructor
    }

    return getAddrRelConstr(base, addr.nesting.path)
  }

  return (prt, constr_linking) => {
    if (constr_linking == null) {
      return null
    }

    if (!Array.isArray(constr_linking)) {
      return oneItem(prt, constr_linking)
    }

    let result = []
    for (var i = 0; i < constr_linking.length; i++) {
      const one = oneItem(prt, constr_linking[i])
      if (!Array.isArray(one)) {
        result.push(one)
      } else {
        result.push(...one)
      }
    }

    return result.length ? result : null
  }
}


export { recurGetConstrByRelLinking }
