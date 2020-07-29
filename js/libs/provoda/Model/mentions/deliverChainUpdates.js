define(function(require) {
'use strict'
var _updateAttr = require('_updateAttr');
var getDepValue = require('../../utils/multiPath/getDepValue')

var target_types = require('./target_types')
var TARGET_TYPE_ATTR = target_types.TARGET_TYPE_ATTR

return function deliverChainUpdates(self, chain) {

  switch (chain.target_type) {
    case TARGET_TYPE_ATTR: {
      _updateAttr(self, chain.addr.as_string, getDepValue(self, chain.addr))

      break;
    }
    default: {
      throw new Error('unknown type')
    }

  }
}
})
