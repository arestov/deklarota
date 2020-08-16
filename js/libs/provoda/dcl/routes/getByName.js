

export default function getByName(self, sp_name) {
  if (self.__routes_matchers_defs == null) {
    return null
  }

  if (self.__modern_subpages_valid) {
    return self.__modern_subpages[sp_name]
  }

  self.__modern_subpages_valid = true

  var result = {}

  for (var i = self.__routes_matchers_runs.length - 1; i >= 0; i--) {
    var cur = self.__routes_matchers_runs[i]
    if (!cur.matched) {
      continue
    }

    for (var jj = 0; jj < cur.matched.length; jj += 2) {
      var key = cur.matched[jj]
      var value = cur.matched[jj + 1]
      result[key] = value
    }
  }

  self.__modern_subpages = result

  return self.__modern_subpages[sp_name]
};
