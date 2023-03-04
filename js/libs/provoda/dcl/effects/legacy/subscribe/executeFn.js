import { getDepsValues } from '../../../../utils/multiPath/readingDeps/getDepsValues'
import _getInterface from '../../../../_internal/interfaces/_getInterface'


const executeFn = (model, dcl, getHandler, apis) => {
  const bind_args = new Array(apis.length + 1)

  bind_args[0] = getHandler(model, dcl)
  for (let i = 0; i < apis.length; i++) {
    bind_args[i + 1] = _getInterface(model, apis[i])
  }

  const deps_values = getDepsValues(model, dcl.fn_deps)

  if (deps_values != null) {
    Array.prototype.push.apply(bind_args, deps_values)
  }


  return dcl.fn.apply(null, bind_args)
}


export default executeFn
