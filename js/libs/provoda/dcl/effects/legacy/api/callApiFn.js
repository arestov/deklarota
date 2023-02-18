import { getDepsValues } from '../../../../utils/multiPath/readingDeps/getDepsValues'

const callApiDclFn = (model, dcl) => {
  if (!dcl.needed_apis) {
    return dcl.fn()
  }

  const args = new Array(dcl.needed_apis.length)
  for (let i = 0; i < dcl.needed_apis.length; i++) {
    args[i] = model._interfaces_used[dcl.needed_apis[i]]
  }

  const deps_values = getDepsValues(model, dcl.fn_deps)

  if (deps_values != null) {
    Array.prototype.push.apply(args, deps_values)
  }

  return dcl.fn.apply(null, args)
}

export default callApiDclFn
