
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

var getEncodedState = spv.memorize(function getEncodedState(state_name) {


  var result1 = getParsedState(state_name)
  if (result1) { // uncomment to help migrate
    var nice = fromLegacy(state_name)
    var best = asString(nice)
    throw new Error('replace ' + state_name + ' by ' + best)
  }

  var result = result1 || modernAsLegacyParsed(state_name)

  if (!result) {
    return null
  }

  if (result.rel_type !== 'nesting') {
    return result
  }

  var copy = spv.cloneObj({}, result)
  copy.addr = toMultiPath(result.nesting_source)

  Object.defineProperty(copy, 'nwatch', fake)

  return copy
})

export default getEncodedState
