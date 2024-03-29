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

  if (result.constructor !== Object) {
    return result
  }

  if (Object.getOwnPropertySymbols(result).length) {
    return result
  }

  return sameObjectIfEmpty(result)

}


const calcData = (model, field, deps, fn) => {
  if (model.hasOwnProperty(field)) {
    return model[field]
  }

  const args = []
  for (let i = 0; i < deps.length; i++) {
    args[i] = model[deps[i]]
  }


  if (args.length && args.every(isNil)) {
    model[field] = null
    return model[field]
  }

  const result = fn(...args, model)
  if (model[field] === result) {
    return model[field]
  }

  const finalResult = getFinalResult(result)

  Object.freeze(finalResult)

  model[field] = finalResult

  return model[field]
}

const cachedField = function(field, deps, _final_compile, fn) {
  return function checkCompiledField(model) {

    return calcData(model, field, deps, fn)
  }
}

export const cacheFields = (schema, model) => {
  for (const field in schema) {
    if (!Object.hasOwnProperty.call(schema, field)) {
      continue
    }

    const [deps, fn] = schema[field]
    calcData(model, field, deps, fn)
  }
}

export default cachedField
