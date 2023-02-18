import parseMultiPath from '../parse'
import now from './now'
import emptyArray from '../../../emptyArray'

const getDepPlaceholder = (optionalNames, dep_ref) => {
  if (!optionalNames?.hasOwnProperty(dep_ref)) {
    throw new Error(`${dep_ref} can't be used here`)
  }

  return optionalNames[dep_ref]
}

export const readingDeps = function getDeps(optionalNames) {
  return (deps) => {
    if (!deps || !deps.length) {
      return emptyArray
    }

    const result = new Array(deps.length)
    for (let i = 0; i < deps.length; i++) {

      const dep_ref = deps[i]
      switch (dep_ref) {
        case '$noop':
        case '$meta$timestamp':
        case '$meta$payload':
          result[i] = getDepPlaceholder(optionalNames, dep_ref)
          continue
      }

      if (dep_ref === '$now') {
        result[i] = now
        continue
      }

      const cur = parseMultiPath(deps[i], true)
      result[i] = cur

      if (cur.nesting && cur.nesting.path && !cur.zip_name) {
        throw new Error('zip name `@one:` or `@all:` should be provided for: ' + deps[i])
      }

    }
    return result
  }
}

export const readingDepsNoCustom = readingDeps()
