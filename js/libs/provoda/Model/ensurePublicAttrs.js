define(function(require) {
'use strict'
var spv = require('spv')
var cloneObj = spv.cloneObj
var isPrivate = require('./isPrivateState')
var replaceModelInState = require('./replaceModelInState')


var ensurePublicAttrs = function(cur_md) {
  if (cur_md._prepared_public_attrs_snapshot) {
    return cur_md._prepared_public_attrs_snapshot
  }

  var result = cloneObj({}, cur_md.states)

  for (var state_name in result){
    var state = result[state_name];
    if (isPrivate(state_name)) {
      delete result[state_name];
      continue;
    }
    result[state_name] = replaceModelInState(state)
  }


  cur_md._prepared_public_attrs_snapshot = result
  return result
}

return ensurePublicAttrs
})
