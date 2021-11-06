import matchChainsByLink from '../matchChainsByLink'

const checkHeavyRelQueries = (self, rel_name) => {
  const list_source = self._highway.live_heavy_rel_query_by_rel_name
  const list = list_source && list_source[rel_name]
  if (list == null) {
    return
  }

  matchChainsByLink(self, list)
}

export default checkHeavyRelQueries
