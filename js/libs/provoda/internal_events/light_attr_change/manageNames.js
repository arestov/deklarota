

import makeKey from '../makeKey'

var toName = new Map()
var toAttr = new Map()

var getAttrByName = function(key) {
  return toAttr.get(key)
}

var getNameByAttr = function(attr) {
  if (toName.has(attr)) {
    return toName.get(attr)
  }

  var key = makeKey(attr)
  toName.set(attr, key)
  toAttr.set(key, attr)
  return key
}

export default {
  getAttrByName: getAttrByName,
  getNameByAttr: getNameByAttr,
}
