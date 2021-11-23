
import spv from '../spv'
const memorize = spv.memorize

export default memorize(function sameName(str) {
  // just store same string
  return str
})
