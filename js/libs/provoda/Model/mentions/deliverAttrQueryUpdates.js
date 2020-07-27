define(function(require) {
'use strict'
var matchChainsByLink = require('./matchChainsByLink')

return function deliverAttrQueryUpdates(self, attr_name) {

  var skeleton = self.__global_skeleton

  var list = skeleton.chains_by_attr[attr_name]

  if (list == null) {
    return
  }

  matchChainsByLink(self, list)
}
})
