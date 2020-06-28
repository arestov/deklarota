define(function(require) {
'use strict'
var isPrivate = require('./isPrivateState')
var replaceModelInState = require('./replaceModelInState')

var assignPublicAttrs = function(cur_md, target) {
  var result = target

  for (var state_name in cur_md.states){
    var state = cur_md.states[state_name];
    if (isPrivate(state_name)) {
      continue;
    }
    result[state_name] = replaceModelInState(state)
  }

  return result
}

var ensurePublicAttrs = function(cur_md) {
  if (cur_md._prepared_public_attrs_snapshot) {
    return cur_md._prepared_public_attrs_snapshot
  }

  var result = assignPublicAttrs(cur_md, {})

  cur_md._prepared_public_attrs_snapshot = result
  return result
}

return ensurePublicAttrs
})
