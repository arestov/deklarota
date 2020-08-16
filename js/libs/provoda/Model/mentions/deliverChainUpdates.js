
import _updateAttr from '_updateAttr'
import getDepValue from '../../utils/multiPath/getDepValue'
import multiPathAsString from '../../utils/multiPath/asString'
import nestCompxHandlers from '../../dcl/nest_compx/handler'
var changeValue = nestCompxHandlers.changeValue

import target_types from './target_types'
var TARGET_TYPE_ATTR = target_types.TARGET_TYPE_ATTR
var TARGET_TYPE_REL = target_types.TARGET_TYPE_REL

export default function deliverChainUpdates(self, chain) {

  switch (chain.target_type) {
    case TARGET_TYPE_ATTR: {
      _updateAttr(self, chain.addr.as_string, getDepValue(self, chain.addr))

      break
    }
    case TARGET_TYPE_REL: {
      var runner = self.__nest_calculations[chain.target_name]
      changeValue(self._currentMotivator(), runner, multiPathAsString(chain.addr), getDepValue(self, chain.addr))
      break
    }
    default: {
      throw new Error('unknown type')
    }

  }
}
