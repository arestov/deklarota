

export default function getByName(self, sp_name) {
  if (self.__routes_matchers_defs == null) {
    return null
  }

  if (self.__modern_subpages_valid) {
    return self.__modern_subpages?.get(sp_name)
  }

  self.__modern_subpages_valid = true

  if (self.__modern_subpages == null) {
    self.__modern_subpages = new Map()
  } else {
    self.__modern_subpages.clear()
  }

  const result = self.__modern_subpages

  for (let i = self.__routes_matchers_defs.length - 1; i >= 0; i--) {
    const cur = self.__routes_matchers_defs[i]
    const path_template = cur.path_template

    const matched = self.__routes_matchers_state.get(path_template)

    if (!matched) {
      continue
    }

    for (let jj = 0; jj < matched.length; jj += 2) {
      const key = matched[jj]
      const value = matched[jj + 1]
      result.set(key, value)
    }
  }


  return result.get(sp_name)
};
