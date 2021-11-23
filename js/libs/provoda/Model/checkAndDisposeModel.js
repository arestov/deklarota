const checkAndDisposeModel = function(self, value) {
  if (!value) {
    return
  }

  if (self.__mentions_as_rel == null) {
    self.die()
    return
  }

  const result = new Set()
  for (const prop in self.__mentions_as_rel) {
    if (!self.__mentions_as_rel.hasOwnProperty(prop)) {
      continue
    }

    const owners_set = self.__mentions_as_rel[prop]
    for (const owner of owners_set) {
      result.add(owner)
    }
  }

  result.delete(self)

  if (result.size) {
    return
  }

  self.die()
}

export default checkAndDisposeModel
