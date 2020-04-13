define(function(require) {
'use strict'
var isPrivate = require('./isPrivateState')
var replaceModelInState = require('./replaceModelInState')

var assignAttr = function(md, attr_name, value) {
  if (isPrivate(attr_name)) {
    return
  }
  md._prepared_public_attrs_snapshot[attr_name] = replaceModelInState(value)
}

return function(md, changes_list) {
  if (!md._prepared_public_attrs_snapshot) {
    return
  }

  for (var i = 0; i < changes_list.length; i+=3) {
    var state_name = changes_list[i+1];
    var value = changes_list[i+2];

    assignAttr(md, state_name, value)

  }

}

})
