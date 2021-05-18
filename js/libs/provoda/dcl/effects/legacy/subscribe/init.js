import { emptyObject } from '../../../../utils/sameObjectIfEmpty'

function initEffectsSubscribe(self) {
  self._interfaces_using = null
  self._interfaces_used = emptyObject
}

export default initEffectsSubscribe
