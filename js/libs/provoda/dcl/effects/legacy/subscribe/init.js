import { emptyObject } from '../../../../utils/sameObjectIfEmpty'

function initEffectsSubscribe(self) {
  self._interfaces_binders = null
  self._interfaces_used = emptyObject
}

export default initEffectsSubscribe
