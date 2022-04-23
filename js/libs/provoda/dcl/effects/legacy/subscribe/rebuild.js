
import spv from '../../../../../spv'
import { cacheFields } from '../../../cachedField'
import { fxListP } from '../../fxP'
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

const _build_cache_interfaces = [
  [fxListP('consume-subscribe')],
  (list) => {
    const result = {}
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      result[item.key] = item
    }
    return result
  }
]

const _interfaces_to_states_index = [
  [fxListP('consume-subscribe')],
  (list) => {
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

    return index
  }
]

const __api_root_dep_apis_subscribe_eff = [
  [fxListP('consume-subscribe')],
  (list) => rootApis(list),
]

const schema = {
  _build_cache_interfaces,
  _interfaces_to_states_index,
  __api_root_dep_apis_subscribe_eff,
}

export default function(self) {
  cacheFields(schema, self)
}
