

const executeFn = (model, dcl, getHandler, apis) => {
  const bind_args = new Array(apis.length + 1)

  bind_args[0] = getHandler(model, dcl)
  for (let i = 0; i < apis.length; i++) {
    bind_args[i + 1] = model._interfaces_used[apis[i]]
  }

  return dcl.fn.apply(null, bind_args)
}


export default executeFn
