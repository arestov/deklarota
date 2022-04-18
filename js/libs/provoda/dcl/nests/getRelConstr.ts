import type { ModelProto } from '../../dkt.types'
import type { RelPath } from '../../utils/multiPath/addr.types'
import getBasePrtByAddr from './getBasePrtByAddr'
import type { RelLink } from './rel.types'

// eslint-disable-next-line no-unused-vars
type GetAddrRelConstr = (base: ModelProto, rel_path: RelPath) => ModelProto

// eslint-disable-next-line no-unused-vars
type GetPrtByRelLink = (prt: ModelProto, constr_linking: RelLink | RelLink[]) => ModelProto | ModelProto[] | null

const recurGetPrtByRelLinking = (getAddrRelConstr: GetAddrRelConstr): GetPrtByRelLink => {

  const oneItem = (prt: ModelProto, linking_item: RelLink): ModelProto => {
    if (linking_item.type == 'constr') {
      const Constr = prt._all_chi[linking_item.value]
      if (Constr == null) {
        throw new Error('missing Constr')
      }
      return Constr.prototype
    }

    if (linking_item.type != 'addr') {
      throw new Error('unknown type')
    }

    const addr = linking_item.value
    if (addr.base_itself) {
      return prt
    }

    const base = getBasePrtByAddr(prt, addr)

    if (!addr.nesting.path) {
      return base
    }

    return getAddrRelConstr(base, addr.nesting.path)
  }

  return (prt: ModelProto, constr_linking: RelLink | RelLink[]): ModelProto | ModelProto[] | null => {
    if (constr_linking == null) {
      return null
    }

    if (!Array.isArray(constr_linking)) {
      return oneItem(prt, constr_linking)
    }

    const result = []
    for (let i = 0; i < constr_linking.length; i++) {
      const one = oneItem(prt, constr_linking[i] as RelLink)
      if (!Array.isArray(one)) {
        result.push(one)
      } else {
        result.push(...one)
      }
    }

    return result.length ? result : null
  }
}


export { recurGetPrtByRelLinking }
