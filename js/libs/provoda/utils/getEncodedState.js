
import spv from '../../spv'
import getParsedState from './getParsedState'
import toMultiPath from './NestingSourceDr/toMultiPath'
import asString from './multiPath/asString'
import fromLegacy from './multiPath/fromLegacy'
import modernAsLegacyParsed from './modernAsLegacyParsed'

const fake = {
  get: function() { throw new Error('wrong nwatch') },
  enumerable: true,
  configurable: true
}

const getEncodedState = spv.memorize(function getEncodedState(state_name) {


  const result1 = getParsedState(state_name)
  if (result1) { // uncomment to help migrate
    const nice = fromLegacy(state_name)
    const best = asString(nice)
    throw new Error('replace ' + state_name + ' by ' + best)
  }

  const result = result1 || modernAsLegacyParsed(state_name)

  if (!result) {
    return null
  }

  if (result.rel_type !== 'nesting') {
    return result
  }

  const copy = spv.cloneObj({}, result)
  copy.addr = toMultiPath(result.nesting_source)

  Object.defineProperty(copy, 'nwatch', fake)

  return copy
})

export default getEncodedState
