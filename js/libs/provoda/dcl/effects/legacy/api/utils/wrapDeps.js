
import spv from '../../../../../../spv'

export default function wrapDeps(deps) {
  if (typeof deps == 'string') {
    return Object.freeze([Object.freeze([deps]), Boolean])
  }
  if (Array.isArray(deps) && typeof deps[0] == 'string') {
    return Object.freeze([deps, spv.hasEveryArgs])
  }

  return deps
}
