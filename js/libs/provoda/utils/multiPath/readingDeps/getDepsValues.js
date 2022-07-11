import getDepValue from '../getDepValue'
import noopForPass from '../../../dcl/passes/noop'
import now from './now'
import { MetaInput, MetaTimestamp } from './specialDeps'



const getDep = function(md, dep, data, timestamp, meta_payload, autocreate_routed_deps) {
  if (dep === noopForPass) {
    return noopForPass
  }

  if (dep === now) {
    return now()
  }

  if (dep == MetaTimestamp) {
    return timestamp
  }

  if (dep == MetaInput) {
    return meta_payload
  }

  return getDepValue(md, dep, data, autocreate_routed_deps)
}

export const getDepsValues = function(md, deps, data, timestamp, meta_payload, autocreate_routed_deps) {
  if (deps == null) {
    return null
  }


  const args = new Array(deps.length)
  for (let i = 0; i < deps.length; i++) {
    const cur = deps[i]
    args[i] = getDep(md, cur, data, timestamp, meta_payload, autocreate_routed_deps)
  }

  return args
}
