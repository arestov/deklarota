import CompxAttrDecl from './item'

const cache = new Map()

const getItem = (obj, name) => {
  if (!cache.has(obj)) {
    cache.set(obj, new CompxAttrDecl(name, obj))
  }

  const value = cache.get(obj)

  if (value.name == name) {
    return value
  }

  // should be rare case, when same deps where reused for another attr
  return new CompxAttrDecl(name, obj)
}

const parseItems = function(typed_state_dcls) {
  if (!typed_state_dcls) {
    return
  }

  for (var name in typed_state_dcls) {
    if (!typed_state_dcls.hasOwnProperty(name)) {
      continue
    }
    typed_state_dcls[name] = getItem(typed_state_dcls[name], name)
  }

  for (var prop of Object.getOwnPropertySymbols(typed_state_dcls)) {
    typed_state_dcls[prop] = getItem(typed_state_dcls[prop], prop)
  }
}

export const clearCache = () => {cache.clear()}

export default parseItems
