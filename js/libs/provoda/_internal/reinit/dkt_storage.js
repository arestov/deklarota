import { attrValueToData, mentionValueToData, modelAttrsToData, modelMentionsToData, modelRelsToData, modelRelToData } from './modelToData'

const noStorage = (self) => {
  return self._highway.dkt_storage == null
}

const CH_GR_LE = 2

export const createModelInDktStorage = (self) => {
  if (noStorage(self)) {
    return null
  }
  const attrs = modelAttrsToData(self)
  const rels = modelRelsToData(self)
  const mentions = modelMentionsToData(self)

  self._highway.dkt_storage.createModel(self._provoda_id, self.model_name, attrs, rels, mentions)
}

export const deleteModelInDktStorage = (self) => {
  if (noStorage(self)) {
    return null
  }
  self._highway.dkt_storage.deleteModel(self._provoda_id)

}

export const updateModelAttrsInDktStorage = (self, changes_list) => {
  if (noStorage(self)) {
    return null
  }

  const converted = new Array(changes_list.length)

  for (let i = 0; i < changes_list.length; i += CH_GR_LE) {
    const attr_name = changes_list[i]
    const value = changes_list[i + 1]

    converted[i] = attr_name
    converted[i + 1] = attrValueToData(value)
  }


  self._highway.dkt_storage.updateModelAttrs(self._provoda_id, converted)
}
export const updateModelRelInDktStorage = (self, rel_name, value) => {
  if (noStorage(self)) {
    return null
  }

  self._highway.dkt_storage.updateModelRel(self._provoda_id, rel_name, modelRelToData(value))
}

export const updateModelMentionInDktStorage = (self, mention_name, value) => {
  if (noStorage(self)) {
    return null
  }

  self._highway.dkt_storage.updateModelMention(self._provoda_id, mention_name, mentionValueToData(value))
}

export const createExpectedRelInDktStorage = (self, key, data) => {
  if (noStorage(self)) {
    return null
  }

  self._highway.dkt_storage.createExpectedRel(key, data)
}

export const deleteExpectedRelInDktStorage = (self, key) => {
  if (noStorage(self)) {
    return null
  }

  self._highway.dkt_storage.deleteExpectedRelInDktStorage(key)
}