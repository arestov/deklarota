import isJustAttrAddr from '../utils/multiPath/isJustAttrAddr'
import parse from '../utils/multiPath/parse'
import asString from '../utils/multiPath/asString'

const is_prod = typeof NODE_ENV != 'undefined' && NODE_ENV === 'production'

export const normalizeAddrsToValuesMap = (map) => {
  const result = {}
  for (var attr in map) {
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

  for (var i = 0; i < self.full_comlxs_list.length; i++) {
    var cur = self.full_comlxs_list[i]
    for (var jj = 0; jj < cur.addrs.length; jj++) {
      var addr = cur.addrs[jj]
      if (addr.base_itself || isJustAttrAddr(addr)) {
        continue
      }

      const addr_str = asString(addr)

      if (!normalized_map.hasOwnProperty(addr_str)) {
        throw new Error('missing value for relation ' + addr_str)
      }
    }


  }

  self.nextTick(self.updateManyStates, [normalized_map], true)
}


export default mockRelations
