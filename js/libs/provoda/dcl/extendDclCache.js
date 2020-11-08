import cloneObj from '../../spv/cloneObj'
import copyProps from './copyProps'

const extendDclCache = function(self, field, added) {
  const result = copyProps(self[field], added)
  if (self[field] === result) {
    return
  }
  self[field] = result
}

export const extendCompAttrs = (self, typed_state_dcls, extendingField) => {

  typed_state_dcls['comp'] = typed_state_dcls['comp'] || {}

  cloneObj(typed_state_dcls['comp'], self[extendingField])
}

export default extendDclCache
