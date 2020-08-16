
import spv from '../../../spv'
var memorize = spv.memorize
var splitByDot = spv.splitByDot

var NestingSourceDr = function(string) {
  var parts = string.split('>')
  this.start_point = parts.length > 1 && parts[0]
  this.selector = splitByDot(parts[parts.length - 1])
}

export default memorize(function parseNSD(string) {
  return new NestingSourceDr(string)
})
