
var constr_mention = require('../../structure/constr_mention')
var nestModelKey = require('./nestModelKey')

var nestConstructor = constr_mention.nestConstructor

export default function(name, item) {
  var key = nestModelKey(name)
  return nestConstructor(name, item, key)
};
