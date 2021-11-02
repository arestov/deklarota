import routePathByModels from '../../routePathByModels'
import { getNestingConstr } from '../../structure/get_constr'
import getRelShape from './getRelShape'

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

const getAddrRelConstr = (prt, rel) => {
  let cur = prt
  for (var i = 0; i < rel.path.length; i++) {
    const rel_name = rel.path[i]

    cur = getRelConstr(cur, rel_name)
    if (!cur) {
      console.log('🤼‍♂️problem', rel.path, rel_name)
      break
    }
  }

  return cur
}

const getBasePrtByAddr = (prt, addr) => {
  var base = getAddrBasePrt(prt, addr.from_base)

  if (!addr.resource.path) {
    return base
  }

  const constr = routePathByModels(base, addr.resource.path, true)


  return constr && constr.prototype
}

const getRelByConstrByLinking = (prt, constr_linking) => {
  if (constr_linking == null) {
    return null
  }

  if (Array.isArray(constr_linking)) {
    throw new Error('implement list of constr_linking')
  }

  if (constr_linking.type == 'constr') {
    return prt._all_chi[constr_linking.value]
  }

  if (constr_linking.type != 'addr') {
    throw new Error('unknown type')
  }

  const addr = constr_linking.value
  if (addr.base_itself) {
    return prt.constructor
  }

  var base = getBasePrtByAddr(prt, addr)

  if (!addr.nesting.path) {
    return base.constructor
  }

  return getAddrRelConstr(base, addr.nesting)
}

const getRelConstrByRef = (self, rel_name) => {
  const rel_shape = getRelShape(self, rel_name)
  if (!rel_shape || !rel_shape.constr_linking) {
    return
  }

  const constr_linking = rel_shape.constr_linking
  return getRelByConstrByLinking(self, constr_linking)

}

function getRelConstr(prt, rel_name) {
  if (!prt.RootConstr) {
    debugger
  }

  var by_ref = getRelConstrByRef(prt, rel_name)
  if (by_ref) {
    return by_ref
  }


  const Constr = getNestingConstr(prt.RootConstr.prototype, prt, rel_name)
  var result = Constr && Constr.prototype
  if (!result) {
    // find by ref rel addr
  }

  return result
}

export { getRelByConstrByLinking, getBasePrtByAddr }
export default getRelConstr
