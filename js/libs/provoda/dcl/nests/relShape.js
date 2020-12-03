import parse from '../../utils/multiPath/parse'


const RelShape = function RelShape(options) {
  this.ref = options.ref ? parse(options.ref) : null
}

const relShape = (options) => {
  if (options == null) {
    return null
  }
  // TODO: validate

  return new RelShape(options)
}

export default relShape
