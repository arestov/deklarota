
import memorize from '../../spv/memorize'

const isSpecialState = memorize(function(state_name) {
  const char = state_name.charAt(0)

  switch (char) {
    case '&':
      throw new Error('require marks should not be passed here. cut it earlier')
    case '^':
    case '@':
    case '#':
    case '<':
      return true
  }

  return false
})

export default isSpecialState
