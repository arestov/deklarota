const checkAndDisposeModel = function(self, value) {
  if (!value) {
    return
  }

  if (self.__mentions_as_rel == null) {
    self.die()
    return
  }

  const all_owners = new Set()
  for (const prop in self.__mentions_as_rel) {
    if (!self.__mentions_as_rel.hasOwnProperty(prop)) {
      continue
    }

    const owners_set = self.__mentions_as_rel[prop]
    for (const owner of owners_set) {
      all_owners.add(owner)
    }
  }

  /* don't consider self reference as owning */
  all_owners.delete(self)

  if (all_owners.size) {
    return
  }

  self.die()
}

export default checkAndDisposeModel
