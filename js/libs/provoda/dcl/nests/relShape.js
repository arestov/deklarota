import parse from '../../utils/multiPath/parse'

const convertLinkingPart = (item) => {
  if (typeof item == 'object') {
    return item
  }

  const addr = parse(item)

  // TODO: validate it's rel, base or route

  return {
    type: 'addr',
    value: addr,
  }
}

const prepareLinking = (value) => {
  if (!Array.isArray(value)) {
    return convertLinkingPart(value)
  }

  return value.map(convertLinkingPart)
}

const RelShape = function RelShape(options) {
  this.any = Boolean(options.any)
  this.constr_linking = options.linking ? prepareLinking(options.linking) : null

  if (!this.any && this.constr_linking == null) {
    throw new Error('expected linking param is empty')
  }

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
