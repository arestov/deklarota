
let counter = 0

const makeKey = typeof Symbol !== 'undefined'
  ? function(key) {
    return Symbol(key)
  } : function() {
    return ++counter
  }

export default makeKey
