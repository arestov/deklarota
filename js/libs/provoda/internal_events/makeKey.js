
var counter = 0

var makeKey = typeof Symbol !== 'undefined'
  ? function(key) {
    return Symbol(key)
  } : function() {
    return ++counter
  }

export default makeKey
