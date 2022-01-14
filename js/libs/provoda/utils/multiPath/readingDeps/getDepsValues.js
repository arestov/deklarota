import getDepValue from '../getDepValue'
import noopForPass from '../../../dcl/passes/noop'
import now from './now'

const getDep = function(md, dep, data) {
  if (dep === noopForPass) {
    return noopForPass
  }

  if (dep === now) {
    return now()
  }

  return getDepValue(md, dep, data)
}

export const getDepsValues = function(md, deps, data) {
  if (deps == null) {
    return null
  }


  const args = new Array(deps.length)
  for (let i = 0; i < deps.length; i++) {
    const cur = deps[i]
    args[i] = getDep(md, cur, data)
  }

  return args
}
