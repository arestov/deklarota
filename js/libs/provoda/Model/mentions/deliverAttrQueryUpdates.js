define(function(require) {
'use strict'
var getAllOnwers = require('./getAllOnwers')
var scheduleDelivering = require('./scheduleDelivering')

return function deliverAttrQueryUpdates(self, attr_name) {

  var skeleton = self.__global_skeleton
  if (skeleton == null && self.view_id != null) {
    return
  }

  if (self.__mentions_as_rel == null) {
    return
  }

  var list = skeleton.chains_by_attr[attr_name]

  if (list == null) {
    return
  }


  var result = []

  for (var i = 0; i < list.length; i++) {
    var link = list[i]
    var owners = self.__mentions_as_rel[link.rel]
    if (owners == null) {
      continue
    }
    for (var owner of owners) {
      getAllOnwers(result, owner, link)
    }
  }

  scheduleDelivering(self, result)
}
})
