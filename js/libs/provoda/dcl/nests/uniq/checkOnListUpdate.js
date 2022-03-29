import getRelUniq from './getRelUniq'
import { MutUniqState } from './MutUniqState'

const checkOnListUpdate = (self, rel_name, list) => {
  if (!Array.isArray(list)) {
    return
  }

  const uniq = getRelUniq(self, rel_name)
  if (uniq == null) {return}

  if (uniq == null || !list.length) {
    return
  }
  // uniq will be validated inside
  new MutUniqState(uniq, list)
}


export default checkOnListUpdate
