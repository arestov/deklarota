define(function(require) {
'use strict'
var updateProxy = require('../updateProxy')
var updateAttr = updateProxy.update
return function gentlyUpdateAttr(self, name, value, opts) {
  if (self._currentMotivator() != null) {
     updateAttr(self, name, value, opts)
     return
   }

   self.input(function() {
     updateAttr(self, name, value, opts)
   })
}
})
