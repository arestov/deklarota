define(function(require) {
'use strict';
var spv = require('spv')
var parse = require('../utils/multiPath/parse')
var memorize = spv.memorize
var isPrivate = memorize(function(str) {
  if (str.startsWith('__') || str.startsWith('@')) {
    return true
  }

  var parsed = parse(str, true)
  return parsed.result_type != 'state'
});
return isPrivate
})
