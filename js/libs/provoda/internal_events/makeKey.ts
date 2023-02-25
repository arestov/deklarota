let counter = 0

const makeKey = typeof Symbol !== 'undefined'
  ? function(key: string | undefined): symbol {
    return Symbol(key)
  } : function(): number {
    return ++counter
  }

export default makeKey
