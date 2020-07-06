define(function(require) {
'use strict'
var AttrsCollector = require('../StatesEmitter/AttrsCollector')
var definedAttrs = require('./definedAttrs')

return function(self) {
  if (self._attrs_collector) {
    // from prototype to instance
    self._attrs_collector = self._attrs_collector
    return
  }


  var atrrs_collector_key = self.constr_id
  self._highway._model_attr_collectors = self._highway._model_attr_collectors || {}
  self._highway._model_attr_collectors[atrrs_collector_key] = self._highway._model_attr_collectors[atrrs_collector_key] || new AttrsCollector(definedAttrs(self))

  self._attrs_collector = self._highway._model_attr_collectors[atrrs_collector_key]
}

})
