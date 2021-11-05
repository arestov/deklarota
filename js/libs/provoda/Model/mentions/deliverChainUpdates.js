
import _updateAttr from '../../_internal/_updateAttr'
import _updateRel from '../../_internal/_updateRel'
import getDepValue from '../../utils/multiPath/getDepValue'

import target_types from './target_types'
var TARGET_TYPE_ATTR = target_types.TARGET_TYPE_ATTR
var TARGET_TYPE_GLUE_REL = target_types.TARGET_TYPE_GLUE_REL

export default function deliverChainUpdates(self, chain) {

  switch (chain.target_type) {
    case TARGET_TYPE_ATTR: {
      _updateAttr(self, chain.target_name, getDepValue(self, chain.addr))

      break
    }
    case TARGET_TYPE_GLUE_REL: {
      _updateRel(self, chain.target_name, getDepValue(self, chain.addr))
      break
    }
    default: {
      throw new Error('unknown type')
    }

  }
}
