
var mark = require('./mark')
var spv = require('spv')

export default function prepare(root) {
  var augmented = spv.inh(root, {}, {})
  return mark(augmented, augmented, null)
};
