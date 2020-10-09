const checkAndDisposeModel = function(self, value) {
  if (!value) {
    return
  }

  if (self.__mentions_as_rel == null) {
    self.die()
    return
  }

  var result = new Set()
  for (var prop in self.__mentions_as_rel) {
    if (!self.__mentions_as_rel.hasOwnProperty(prop)) {
      continue
    }

    var owners_set = self.__mentions_as_rel[prop]
    for (var owner of owners_set) {
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
