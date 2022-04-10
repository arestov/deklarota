
import memorize from '../../../spv/memorize'
import splitByDot from '../../../spv/splitByDot'

const NestingSourceDr = function(string) {
  const parts = string.split('>')
  this.start_point = parts.length > 1 && parts[0]
  this.selector = splitByDot(parts[parts.length - 1])
}

export default memorize(function parseNSD(string) {
  return new NestingSourceDr(string)
})
