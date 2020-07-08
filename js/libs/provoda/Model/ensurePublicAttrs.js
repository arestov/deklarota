define(function(require) {
'use strict'
var replaceModelInState = require('./replaceModelInState')

var assignPublicAttrs = function(cur_md, target) {
  var result = target
  var public_attrs = cur_md.__getPublicAttrs()
  for (var i = 0; i < public_attrs.length; i++) {
    var state_name = public_attrs[i]
    var state = cur_md.states[state_name];
    result[state_name] = replaceModelInState(state)
  }

  return result
}

var ensurePublicAttrs = function(cur_md) {
  /*
    consider to send all props to view and clean it up on view side
    this will let remove big _prepared_public_attrs_snapshot
  */

  if (cur_md._prepared_public_attrs_snapshot) {
    return cur_md._prepared_public_attrs_snapshot
  }

  var result = assignPublicAttrs(cur_md, {})

  cur_md._prepared_public_attrs_snapshot = result
  return result
}

ensurePublicAttrs.assignPublicAttrs = assignPublicAttrs

return ensurePublicAttrs
})
