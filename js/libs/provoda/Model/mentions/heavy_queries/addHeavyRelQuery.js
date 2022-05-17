import addChainToIndex, { sortChainLinks } from '../addChainToIndex'
import target_types from '../target_types'
import handleHeavyRelQueryChange from './handleHeavyRelQueryChange'

const { TARGET_TYPE_HEAVY_REQUESTER } = target_types

export const addHeavyRelQueryToRuntime = (self, chain) => {
  if (chain.target_type != TARGET_TYPE_HEAVY_REQUESTER) {
    throw new Error('addHeavyRelQuery works only with TARGET_TYPE_HEAVY_REQUESTER')
  }

  if (!self._highway.live_heavy_rel_query_by_rel_name) {
    self._highway.live_heavy_rel_query_by_rel_name = {}
  }
  const storage = self._highway.live_heavy_rel_query_by_rel_name
  addChainToIndex(storage, chain)
  for (let i = 0; i < chain.list.length; i++) {
    sortChainLinks(storage, chain.list[i].rel)
  }
}

const addHeavyRelQuery = (self, chain) => {
  addHeavyRelQueryToRuntime(self, chain)
  handleHeavyRelQueryChange(self, chain)

}

export default addHeavyRelQuery
