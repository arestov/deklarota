

import makeKey from '../makeKey'

const toName = new Map()
const toAttr = new Map()

const getAttrByName = function(key) {
  return toAttr.get(key)
}

const getNameByAttr = function(attr) {
  if (typeof attr == 'symbol') {
    return attr
  }
  if (toName.has(attr)) {
    return toName.get(attr)
  }

  const key = makeKey(attr)
  toName.set(attr, key)
  toAttr.set(key, attr)
  return key
}

export default {
  getAttrByName: getAttrByName,
  getNameByAttr: getNameByAttr,
}
