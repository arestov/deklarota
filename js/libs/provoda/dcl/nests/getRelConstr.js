import { getNestingConstr } from '../../structure/get_constr'
import getRelShape from './getRelShape'
import getBasePrtByAddr from './getBasePrtByAddr'

const getAddrRelConstr = (prt, rel_path) => {
  let cur = prt
  for (var i = 0; i < rel_path.length; i++) {
    const rel_name = rel_path[i]

    cur = getRelConstr(cur, rel_name)
    if (!cur) {
      console.log('🤼‍♂️problem', rel_path, rel_name)
      break
    }
  }

  return cur
}

const recurGetConstrByRelLinking = (getAddrRelConstr) => (prt, constr_linking) => {
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

  return getAddrRelConstr(base, addr.nesting.path)
}

const getRelConstrByRelLinking = recurGetConstrByRelLinking(getAddrRelConstr)

const getRelConstrByRef = (self, rel_name) => {
  const rel_shape = getRelShape(self, rel_name)
  if (!rel_shape || !rel_shape.constr_linking) {
    return
  }

  const constr_linking = rel_shape.constr_linking
  return getRelConstrByRelLinking(self, constr_linking)

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

export { recurGetConstrByRelLinking, getBasePrtByAddr, getRelConstrByRelLinking }
export default getRelConstr
