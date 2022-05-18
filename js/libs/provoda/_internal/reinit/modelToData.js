const getId = (item) => item?._provoda_id

const modelAsValue = (someval) => {
  if (getId(someval)) {
    return { _provoda_id: someval._provoda_id }
  }

  return someval
}

const listOrOneItem = (value) => {
  if (!Array.isArray(value)) {
    return modelAsValue(value)
  }

  if (!value.some(getId)) {
    return value
  }

  return value.map(modelAsValue)
}

const modelToData = (self) => {
  const attrs = {}
  for (let i = 0; i < self._attrs_collector.all.length; i++) {
    const cur = self._attrs_collector.all[i]
    attrs[cur] = listOrOneItem(self.getAttr(cur))
  }

  const rels = {}

  for (const rel_name in self.children_models) {
    if (!Object.hasOwnProperty.call(self.children_models, rel_name)) {
      continue
    }

    const cur = self.children_models[rel_name]
    if (!Array.isArray(cur)) {
      rels[rel_name] = getId(cur)
      continue
    }

    rels[rel_name] = cur.map(getId)
  }

  const mentions = {}

  for (const rel_name in self.__mentions_as_rel) {
    if (!Object.hasOwnProperty.call(self.__mentions_as_rel, rel_name)) {
      continue
    }
    const cur = self.__mentions_as_rel[rel_name]
    if (cur == null) {
      continue
    }

    mentions[rel_name] = []

    for (const md of cur) {
      mentions[rel_name].push(getId(md))
    }
  }

  return {
    id: self._provoda_id,
    model_name: self.model_name,
    attrs,
    rels,
    mentions,
  }
}

export default modelToData
