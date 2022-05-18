const getId = (item) => item?._provoda_id

const modelAsValue = (someval) => {
  if (getId(someval)) {
    return { _provoda_id: someval._provoda_id }
  }

  return someval
}

export const attrValueToData = (value) => {
  if (!Array.isArray(value)) {
    return modelAsValue(value)
  }

  if (!value.some(getId)) {
    return value
  }

  return value.map(modelAsValue)
}

export const modelAttrsToData = (self) => {
  const attrs = {}
  for (let i = 0; i < self._attrs_collector.all.length; i++) {
    const cur = self._attrs_collector.all[i]
    attrs[cur] = attrValueToData(self.getAttr(cur))
  }
  return attrs
}

export const modelRelToData = (cur) => {
  if (!Array.isArray(cur)) {
    return getId(cur)
  }

  return cur.map(getId)
}

export const modelRelsToData = (self) => {
  const rels = {}

  for (const rel_name in self.children_models) {
    if (!Object.hasOwnProperty.call(self.children_models, rel_name)) {
      continue
    }



    const cur = self.children_models[rel_name]
    rels[rel_name] = modelRelToData(cur)
  }

  return rels
}

export const mentionValueToData = (cur) => {
  const result = []

  for (const md of cur) {
    result.push(getId(md))
  }

  return result
}

export const modelMentionsToData = (self) => {
  const mentions = {}

  for (const rel_name in self.__mentions_as_rel) {
    if (!Object.hasOwnProperty.call(self.__mentions_as_rel, rel_name)) {
      continue
    }
    const cur = self.__mentions_as_rel[rel_name]
    if (cur == null) {
      continue
    }

    mentions[rel_name] = mentionValueToData(cur)
  }

  return mentions
}

const modelToData = (self) => {
  const attrs = modelAttrsToData(self)
  const rels = modelRelsToData(self)
  const mentions = modelMentionsToData(self)


  return {
    id: self._provoda_id,
    model_name: self.model_name,
    attrs,
    rels,
    mentions,
  }
}

export default modelToData