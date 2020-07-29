define(function(require) {
'use strict'
var _updateAttr = require('_updateAttr');
var getDepValue = require('../../utils/multiPath/getDepValue')
var multiPathAsString = require('../../utils/multiPath/asString')

var nestCompxHandlers = require('../../dcl/nest_compx/handler')
var changeValue = nestCompxHandlers.changeValue

var target_types = require('./target_types')
var TARGET_TYPE_ATTR = target_types.TARGET_TYPE_ATTR
var TARGET_TYPE_REL = target_types.TARGET_TYPE_REL

return function deliverChainUpdates(self, chain) {

  switch (chain.target_type) {
    case TARGET_TYPE_ATTR: {
      _updateAttr(self, chain.addr.as_string, getDepValue(self, chain.addr))

      break;
    }
    case TARGET_TYPE_REL: {
      var runner = self.__nest_calculations[chain.target_name]
      changeValue(self._currentMotivator(), runner, multiPathAsString(chain.addr), getDepValue(self, chain.addr))
      break;
    }
    default: {
      throw new Error('unknown type')
    }

  }
}
})
