define(function (require) {
'use strict';

var makeKey = require('../makeKey')

var toName = {}
var toAttr = {}

var getAttrByName = function(key) {
  if (toAttr.hasOwnProperty(key)) {
    return toAttr[key]
  }

  return null
}

var getNameByAttr = function(attr) {
  if (toName.hasOwnProperty(attr)) {
    return toName[attr]
  }

  var key = makeKey(attr)
  toName[attr] = key
  toAttr[key] = attr
  return key
}

return {
  getAttrByName: getAttrByName,
  getNameByAttr: getNameByAttr,
}

})
