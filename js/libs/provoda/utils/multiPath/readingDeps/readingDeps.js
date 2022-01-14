import parseMultiPath from '../parse'
import now from './now'
import emptyArray from '../../../emptyArray'

export const readingDeps = function getDeps(optionalNames) {
  return (deps) => {
    if (!deps || !deps.length) {
      return emptyArray
    }

    const result = new Array(deps.length)
    for (let i = 0; i < deps.length; i++) {


      if (deps[i] === '$noop') {
        if (!optionalNames?.hasOwnProperty(deps[i])) {
          throw new Error(`${deps[i]} can't be used here`)
        }
        result[i] = optionalNames[deps[i]]
        continue
      }

      if (deps[i] === '$now') {
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
