define(function(require) {
'use strict'

var updateNesting = require('./updateNesting')

return function gentlyUpdateNesting(self, collection_name, input, opts) {
  if (self._currentMotivator() != null) {
    updateNesting(self, collection_name, input, opts)
    return
  }

  self.input(function() {
    updateNesting(self, collection_name, input, opts)
  })
}
})
