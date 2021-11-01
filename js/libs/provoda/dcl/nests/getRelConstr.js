import { getNestingConstr } from '../../structure/get_constr'
import getRelShape from './getRelShape'

const getAddrBaseConstr = (self, from_base) => {
  if (!from_base || !from_base.type) {
    return self
  }

  switch (from_base.type) {
    case 'root': {
      return self.RootConstr.prototype
    }
    case 'parent': {
      let count = from_base.steps
      let result = self
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

const getAddrRelConstr = (base, rel) => {
  let cur = base
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

const getRelByConstrByLinking = (self, constr_linking) => {
  if (Array.isArray(constr_linking)) {
    throw new Error('implement list of constr_linking')
  }

  if (constr_linking.type != 'addr') {
    throw new Error('implement support for not addr')
  }

  var base = getAddrBaseConstr(self, constr_linking.value.from_base)

  if (constr_linking.value.base_itself) {
    return self.constructor
  }
  return getAddrRelConstr(base, constr_linking.value.nesting)
}

const getRelConstrByRef = (self, rel_name) => {
  const rel_shape = getRelShape(self, rel_name)
  if (!rel_shape || !rel_shape.constr_linking) {
    return
  }

  const constr_linking = rel_shape.constr_linking
  return getRelByConstrByLinking(self, constr_linking)

}

function getRelConstr(self, rel_name) {
  if (!self.RootConstr) {
    debugger
  }

  var by_ref = getRelConstrByRef(self, rel_name)
  if (by_ref) {
    return by_ref
  }


  const Constr = getNestingConstr(self.RootConstr.prototype, self, rel_name)
  var result = Constr && Constr.prototype
  if (!result) {
    // find by ref rel addr
  }

  return result
}

export { getRelByConstrByLinking }
export default getRelConstr
