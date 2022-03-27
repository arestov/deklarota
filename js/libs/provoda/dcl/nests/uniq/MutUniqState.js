
export const addUniqItem = (mut_uniq_state, md) => {
  for (let i = 0; i < mut_uniq_state.uniq.length; i++) {
    const attr = mut_uniq_state.uniq[i]
    const value = md.getAttr(attr)
    if (value == null) {
      continue
    }
    if (mut_uniq_state.indices[attr].has(value)) {
      throw new Error('rel should have uniq items')
    }
    mut_uniq_state.indices[attr].set(value, md)
  }
}


export const findDataDup = (mut_uniq_state, attrs) => {
  if (mut_uniq_state == null || attrs == null) {
    return null
  }

  // checking only raw (non instance) attrs here

  for (let i = 0; i < mut_uniq_state.uniq.length; i++) {
    const attr = mut_uniq_state.uniq[i]
    const value = attrs[attr]
    if (value == null) {
      continue
    }
    if (mut_uniq_state.indices[attr].has(value)) {
      return mut_uniq_state.indices[attr].get(value)
    }
  }

  return null
}

export function MutUniqState(uniq, list_to_check) {
  this.uniq = uniq
  this.indices = {}

  for (let i = 0; i < uniq.length; i++) {
    const attr = uniq[i]
    this.indices[attr] = new Map()
  }

  if (!list_to_check) {
    return
  }

  for (let i = 0; i < list_to_check.length; i++) {
    const model = list_to_check[i]
    addUniqItem(this, model)
  }
}
