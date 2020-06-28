define(function(require) {
'use strict'
var isPrivate = require('./isPrivateState')
var replaceModelInState = require('./replaceModelInState')


var ensurePublicAttrs = function(cur_md) {
  if (cur_md._prepared_public_attrs_snapshot) {
    return cur_md._prepared_public_attrs_snapshot
  }

  var result = {}

  for (var state_name in cur_md.states){
    var state = cur_md.states[state_name];
    if (isPrivate(state_name)) {
      continue;
    }
    result[state_name] = replaceModelInState(state)
  }


  cur_md._prepared_public_attrs_snapshot = result
  return result
}

return ensurePublicAttrs
})
