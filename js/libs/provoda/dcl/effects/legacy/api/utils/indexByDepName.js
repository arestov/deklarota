const checkAndAdd = (result, cur) => {
  if (!cur.deps_name) {
    return
  }
  result[cur.deps_name] = cur
}

export default function indexByDepName(obj) {
  if (!obj) {
    return
  }
  const result = {}

  for (const name in obj) {
    if (!obj.hasOwnProperty(name)) {
      continue
    }
    const cur = obj[name]
    checkAndAdd(result, cur)
  }

  for (const prop of Object.getOwnPropertySymbols(obj)) {
    const cur = obj[prop]
    checkAndAdd(result, cur)
  }

  return result
};
