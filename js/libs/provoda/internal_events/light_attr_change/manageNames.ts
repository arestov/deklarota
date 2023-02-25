

import makeKey from '../makeKey'

const toName = new Map<string, symbol | number>()
const toAttr = new Map<symbol | number, string>()

const getAttrByName = function(key: symbol | number): string | undefined {
  return toAttr.get(key)
}

const getNameByAttr = function(attr: symbol | string): symbol | number {
  if (typeof attr === 'symbol') {
    return attr
  }
  if (toName.has(attr)) {
    return toName.get(attr)!
  }

  const key = makeKey(attr)
  toName.set(attr, key)
  toAttr.set(key, attr)
  return key
}

export default {
  getAttrByName,
  getNameByAttr,
}
