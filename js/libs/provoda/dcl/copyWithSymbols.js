import { doCopy } from '../../spv/cloneObj'

const copyWithSymbols = (result, source) => {
  doCopy(result, source)

  if (!source) {
    return result
  }

  for (const prop of Object.getOwnPropertySymbols(source)) {
    result[prop] = source[prop]
  }

  return result
}


export default copyWithSymbols
