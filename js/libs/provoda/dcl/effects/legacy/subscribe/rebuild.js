
import spv from '../../../../../spv'
const rootApis = function(list) {

  const index = {}
  for (let i = 0; i < list.length; i++) {
    const apis = list[i].apis

    for (let jj = 0; jj < apis.length; jj++) {
      const cur = apis[jj]
      if (!spv.startsWith(cur, '#')) {continue}
      index[cur.slice(1)] = true
    }
  }

  return Object.keys(index)
}

export default function(self, list) {
  self._build_cache_interfaces = {}

  self._interfaces_to_states_index = {}

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    self._build_cache_interfaces[item.key] = item
  }

  const index = {}
  for (let i = 0; i < list.length; i++) {
    const apis = list[i].apis
    for (let b = 0; b < apis.length; b++) {
      const name = apis[b]
      if (!index[name]) {
        index[name] = []
      }
      index[name].push(list[i])
    }
  }



  self.__api_root_dep_apis_subscribe_eff = rootApis(list)
  self._interfaces_to_states_index = index
}
