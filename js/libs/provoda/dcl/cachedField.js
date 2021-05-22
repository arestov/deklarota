import sameArrayIfEmpty from '../utils/sameArrayIfEmpty'
import sameObjectIfEmpty from '../utils/sameObjectIfEmpty'

const isNil = function isNil(arg) {
  return arg == null
}

const getFinalResult = (result) => {
  if (result == null) {
    return null
  }

  if (Array.isArray(result)) {
    return sameArrayIfEmpty(result)
  }

  if (Object.getOwnPropertySymbols(result).length) {
    return result
  }

  return sameObjectIfEmpty(result)

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

    var result = fn(...args, model)
    if (model[field] === result) {
      return model[field]
    }

    const finalResult = getFinalResult(result)

    model[field] = finalResult

    return model[field]
  }
}
export default cachedField
