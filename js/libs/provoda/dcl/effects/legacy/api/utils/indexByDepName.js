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
  var result = {}

  for (var name in obj) {
    if (!obj.hasOwnProperty(name)) {
      continue
    }
    var cur = obj[name]
    checkAndAdd(result, cur)
  }

  for (var prop of Object.getOwnPropertySymbols(obj)) {
    var cur = obj[prop]
    checkAndAdd(result, cur)
  }

  return result
};
