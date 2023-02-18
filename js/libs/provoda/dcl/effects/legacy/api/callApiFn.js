const callApiDclFn = (model, dcl) => {
  if (!dcl.needed_apis) {
    return dcl.fn()
  }

  const args = new Array(dcl.needed_apis.length)
  for (let i = 0; i < dcl.needed_apis.length; i++) {
    args[i] = model._interfaces_used[dcl.needed_apis[i]]
  }

  return dcl.fn.apply(null, args)
}

export default callApiDclFn
