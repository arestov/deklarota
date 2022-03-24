import getRelFromInitParams from '../../../utils/getRelFromInitParams'

export const needsRefs = function(init_data) {
  const rels = getRelFromInitParams(init_data)
  for (const nesting_name in rels) {
    if (!rels.hasOwnProperty(nesting_name)) {
      continue
    }
    const cur = rels[nesting_name]

    if (cur == null) {
      continue
    }
    if (!Array.isArray(cur)) {
      if (needsRefs(cur)) {
        return true
      }
      continue
    }

    if (cur.some(needsRefs)) {
      return true
    }

  }

  if (init_data.use_ref_id) {
    return true
  }

}
