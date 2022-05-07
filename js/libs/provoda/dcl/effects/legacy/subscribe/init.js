import { emptyObject } from '../../../../utils/sameObjectIfEmpty'

function initEffectsSubscribe(self) {
  self.__interfaces_to_subscribers_removers = null
  self._interfaces_used = emptyObject
}

export default initEffectsSubscribe
