import parse from '../../utils/multiPath/parse'

const convertLinkingPart = (item) => {
  if (typeof item == 'object') {
    return item
  }

  return {
    type: 'addr',
    value: parse(item),
  }
}

const prepareLinking = (value) => {
  if (!Array.isArray(value)) {
    return convertLinkingPart(value)
  }

  return value.map(convertLinkingPart)
}

const RelShape = function RelShape(options) {

  this.constr_linking = options.linking ? prepareLinking(options.linking) : null

  this.many = Boolean(options.many)

  Object.freeze(this)
}

const relShape = (options) => {
  if (options == null) {
    return null
  }
  // TODO: validate

  return new RelShape(options)
}

export default relShape
