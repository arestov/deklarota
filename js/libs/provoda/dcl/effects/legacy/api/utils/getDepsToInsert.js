

const doCopy = function(item, _self, extended_comp_attrs) {
  if (!item.deps_name) {
    throw new Error('item should have deps_name')
  }
  extended_comp_attrs[item.deps_name] = item.all_deps
}

const empty = []

export default function getDepsToInsert(source, self, extended_comp_attrs) {
  if (!source) {return empty}

  const result = []

  for (const name in source) {
    if (!source.hasOwnProperty(name)) {continue}

    const cur = source[name]
    if (!cur.all_deps) {continue}

    result.push(name)

    doCopy(cur, self, extended_comp_attrs)
  }

  for (const prop of Object.getOwnPropertySymbols(source)) {
    const cur = source[prop]
    if (!cur.all_deps) {continue}

    result.push(prop)

    doCopy(cur, self, extended_comp_attrs)
  }

  return result
};
