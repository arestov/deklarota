define(function(require) {
'use strict'
var AttrsCollector = require('../StatesEmitter/AttrsCollector')
var definedAttrs = require('./definedAttrs')

return function(self) {
  var atrrs_collector_key = self.mpx.__getBhvId() + '_' + self.constr_id
  self._highway._view_attr_collectors = self._highway._view_attr_collectors || {}
  self._highway._view_attr_collectors[atrrs_collector_key] = self._highway._view_attr_collectors[atrrs_collector_key] || new AttrsCollector(definedAttrs(self))

  self._attrs_collector = self._highway._view_attr_collectors[atrrs_collector_key]
}

})
