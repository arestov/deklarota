
import { hasEveryArgs } from '../../../../../../spv'

type CompAttr = readonly [readonly string[], Function?]

export default function wrapDeps<T extends CompAttr>(deps: string | string[] | CompAttr | T): CompAttr | T {
  if (typeof deps == 'string') {
    const result: CompAttr = [Object.freeze([deps]), Boolean]
    return Object.freeze(result)
  }

  if (Array.isArray(deps) && typeof deps[0] == 'string') {
    const fn = deps.length == 1 ? Boolean : hasEveryArgs
    const result: CompAttr = [deps, fn]
    Object.freeze(result)
    return result
  }

  return deps as T
}
