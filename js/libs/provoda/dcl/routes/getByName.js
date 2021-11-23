

export default function getByName(self, sp_name) {
  if (self.__routes_matchers_defs == null) {
    return null
  }

  if (self.__modern_subpages_valid) {
    return self.__modern_subpages[sp_name]
  }

  self.__modern_subpages_valid = true

  const result = {}

  for (let i = self.__routes_matchers_runs.length - 1; i >= 0; i--) {
    const cur = self.__routes_matchers_runs[i]
    if (!cur.matched) {
      continue
    }

    for (let jj = 0; jj < cur.matched.length; jj += 2) {
      const key = cur.matched[jj]
      const value = cur.matched[jj + 1]
      result[key] = value
    }
  }

  self.__modern_subpages = result

  return self.__modern_subpages[sp_name]
};
