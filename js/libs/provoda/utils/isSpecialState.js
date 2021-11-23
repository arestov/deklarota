
import spv from '../../spv'

const spec_chars = { '^': true, '@': true, '#': true, '<': true }
const isSpecialState = spv.memorize(function(state_name) {
  const char = state_name.charAt(0)
  if (char === '&') {
    throw new Error('require marks should not be passed here. cut it earlier')
  }
  return spec_chars[state_name.charAt(0)]
})

export default isSpecialState
