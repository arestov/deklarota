const removeHeavyRelQuery = (self, chain) => {
  if (!self._highway.live_heavy_rel_query_by_rel_name) {
    return
  }
  const storage = self._highway.live_heavy_rel_query_by_rel_name

  for (let i = 0; i < chain.list.length; i++) {
    const cur = chain.list[i]

    const list_to_check = storage[cur.rel]

    const num = list_to_check.indexOf(cur)
    if (num == -1) {
      continue
    }
    list_to_check.splice(num, 1)

    if (!list_to_check.length) {
      storage[cur.rel] = null
    }
  }

}

export default removeHeavyRelQuery
