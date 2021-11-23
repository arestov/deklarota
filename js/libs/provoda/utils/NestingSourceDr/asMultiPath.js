
import spv from '../../../spv'
import parse from './parse'
import toMultiPath from './toMultiPath'

export default spv.memorize(function(string) {
  const nesting_source = parse(string)
  return toMultiPath(nesting_source)
})
