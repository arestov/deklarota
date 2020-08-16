
var spv = require('spv')
var isSpecialState = require('./isSpecialState')

export default function getShortStateName(state_path) {
  var enc = isSpecialState(state_path)
  return enc ? state_path : spv.getFieldsTree(state_path)[0]
};
