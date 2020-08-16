
var replaceModelInState = require('./replaceModelInState')

var assignPublicAttrs = function(cur_md, target) {
  var result = target
  var public_attrs = cur_md.__getPublicAttrs()
  for (var i = 0; i < public_attrs.length; i++) {
    var state_name = public_attrs[i]
    var state = cur_md.states[state_name]
    result[state_name] = replaceModelInState(state)
  }

  return result
}

var ensurePublicAttrs = function(cur_md) {
  var result = assignPublicAttrs(cur_md, {})
  return result
}

ensurePublicAttrs.assignPublicAttrs = assignPublicAttrs

export default ensurePublicAttrs
