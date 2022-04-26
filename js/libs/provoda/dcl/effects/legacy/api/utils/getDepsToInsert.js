

const doCopy = function(item, extended_comp_attrs) {
  if (!item.deps_name) {
    throw new Error('item should have deps_name')
  }
  extended_comp_attrs[item.deps_name] = item.all_deps
}

const empty = []

export default function getDepsToInsert(source, extended_comp_attrs) {
  if (!source) {return empty}

  for (const name in source) {
    if (!source.hasOwnProperty(name)) {continue}

    const cur = source[name]
    if (!cur.all_deps) {continue}

    doCopy(cur, extended_comp_attrs)
  }

  for (const prop of Object.getOwnPropertySymbols(source)) {
    const cur = source[prop]
    if (!cur.all_deps) {continue}

    doCopy(cur, extended_comp_attrs)
  }
};
