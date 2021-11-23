export default function rebuild(self, index) {
  const result = {}

  for (const name in index) {
    if (!index.hasOwnProperty(name)) {
      continue
    }

    const cur = index[name]
    if (!cur.rel_name) {continue}

    result[cur.rel_name] = index[name]
  }

  self.__handleNesting = result
}
