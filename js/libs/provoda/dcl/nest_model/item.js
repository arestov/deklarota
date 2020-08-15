define(function(require) {
'use strict'
var constr_mention = require('../../structure/constr_mention')
var nestModelKey = require('./nestModelKey')

var nestConstructor = constr_mention.nestConstructor

return function(name, item) {
  var key = nestModelKey(name)
  return nestConstructor(name, item, key)
}
})
