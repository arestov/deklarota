
const empty = ''
const isMeaningfulValue = function(value) {
  // https://twitter.com/jonathoda/status/960952613507231744
  // https://twitter.com/jonathoda/status/1138881930399703041
  return value != null && value !== empty
}
export default isMeaningfulValue
