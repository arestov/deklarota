define(function(require) {
'use strict'
var AttrsCollector = require('../StatesEmitter/AttrsCollector')
var definedAttrs = require('./definedAttrs')

return function(self) {
  if (!self._attrs_collector) {
    // ensure that prototype has AttrsCollector
    self.constructor.prototype._attrs_collector =  new AttrsCollector(definedAttrs(self.constructor.prototype))
    return
  }

  // from prototype to instance
  self._attrs_collector = self._attrs_collector
}

})
