define(function(require) {
'use strict'
var matchChainsByLink = require('./matchChainsByLink')

return function deliverRelQueryUpdates(self, rel_name) {
  var skeleton = self.__global_skeleton

  var list = skeleton.chains_by_rel[rel_name]

  if (list == null) {
    return
  }

  matchChainsByLink(self, list)
}
})
