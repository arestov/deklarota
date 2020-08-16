
import spv from 'spv'
import NestWatch from '../nest-watch/NestWatch'
import getStateWriter from '../nest-watch/getStateWriter'
import getParsedState from './getParsedState'
import toMultiPath from './NestingSourceDr/toMultiPath'
import asString from './multiPath/asString'
import fromLegacy from './multiPath/fromLegacy'
import modernAsLegacyParsed from './modernAsLegacyParsed'

var getEncodedState = spv.memorize(function getEncodedState(state_name) {


  var result1 = getParsedState(state_name)
  if (result1) { // uncomment to help migrate
    var nice = fromLegacy(state_name)
    var best = asString(nice)
    console.warn('replace ' + state_name + ' by ' + best)
  }

  var result = result1 || modernAsLegacyParsed(state_name)

  if (!result) {
    return null
  }

  if (result.rel_type !== 'nesting') {
    return result
  }

  var doubleHandler = getStateWriter(result.full_name, result.state_name, result.zip_name)
  var nwatch = new NestWatch(toMultiPath(result.nesting_source), result.state_name, {
    onchd_state: doubleHandler,
    onchd_count: doubleHandler,
  })

  var copy = spv.cloneObj({}, result)
  copy.nwatch = nwatch

  return copy
})

export default getEncodedState
