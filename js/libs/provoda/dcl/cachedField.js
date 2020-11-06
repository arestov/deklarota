const isNil = function isNil(arg) {
  return arg == null
}

const cachedField = function(field, deps, final_compile, fn) {
  return function checkCompiledField(model) {
    if (model.hasOwnProperty(field)) {
      return model[field]
    }

    var args = []
    for (var i = 0; i < deps.length; i++) {
      args[i] = model[deps[i]]
    }


    if (args.length && args.every(isNil)) {
      model[field] = null
      return model[field]
    }

    model[field] = fn(...args, model)

    return model[field]
  }
}
export default cachedField
