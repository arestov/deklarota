import isJustAttrAddr from '../utils/multiPath/isJustAttrAddr'
import parse from '../utils/multiPath/parse'
import asString from '../utils/multiPath/asString'
import { FlowStepUpdateManyAttrs } from './flowStepHandlers.types'

const is_prod = typeof NODE_ENV != 'undefined' && NODE_ENV === 'production'

export const normalizeAddrsToValuesMap = (map) => {
  const result = {}
  for (const attr in map) {
    if (!map.hasOwnProperty(attr)) {
      continue
    }

    const addr = parse(attr)
    result[asString(addr)] = map[attr]
  }

  return result
}

const mockRelations = (self) => {
  if (is_prod) {return}

  const normalized_map = normalizeAddrsToValuesMap(self._highway.relation_mocks)

  for (let i = 0; i < self.$attrs$as_external_target.length; i++) {
    const addr = self.$attrs$as_external_target[i]

    if (addr.base_itself || isJustAttrAddr(addr)) {
      continue
    }

    const addr_str = asString(addr)

    if (!normalized_map.hasOwnProperty(addr_str)) {
      throw new Error('missing value for relation ' + addr_str)
    }


  }

  self.nextTick(FlowStepUpdateManyAttrs, [normalized_map], true)
}


export default mockRelations
