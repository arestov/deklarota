const getId = (item) => item?._node_id

const modelAsValue = (someval) => {
  if (getId(someval)) {
    return { _node_id: someval._node_id }
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

  for (let i = 0; i < self.__defined_attrs_bool.length; i++) {
    const cur = self.__defined_attrs_bool[i]
    attrs[cur.name] = attrValueToData(self.getAttr(cur.name))
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

  for (const rel_name in self._extendable_nest_index) {
    if (!Object.hasOwnProperty.call(self._extendable_nest_index, rel_name)) {
      continue
    }

    rels[rel_name] = modelRelToData(self.children_models[rel_name])
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
    id: self._node_id,
    model_name: self.model_name,
    attrs,
    rels,
    mentions,
  }
}

export default modelToData
