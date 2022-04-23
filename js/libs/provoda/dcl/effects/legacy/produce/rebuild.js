
import spv from '../../../../../spv'
import indexByDepName from '../api/utils/indexByDepName'


const buildIndexFromListInProp = (result, cur, list_prop_name) => {
  const list = cur[list_prop_name]
  if (!list) {
    return
  }
  for (let i = 0; i < list.length; i++) {
    const state_name = list[i]
    if (!result[state_name]) {
      result[state_name] = []
    }
    result[state_name].push(cur)
  }
}

const indexByList = function(obj, list_name) {
  if (!obj) {
    return
  }
  const result = {}

  for (const name in obj) {
    if (!obj.hasOwnProperty(name)) {
      continue
    }
    const cur = obj[name]
    buildIndexFromListInProp(result, cur, list_name)
  }

  for (const prop of Object.getOwnPropertySymbols(obj)) {
    const cur = obj[prop]
    buildIndexFromListInProp(result, cur, list_name)
  }

  return result
}

function makeRequiredApiIndex(result, cur, checking_prefix) {
  for (let i = 0; i < cur.apis.length; i++) {
    if (!spv.startsWith(cur.apis[i], checking_prefix)) {continue}
    result[cur.apis[i].slice(1)] = true
  }
}


function rootApis(obj) {
  if (!obj) {return}

  const index = {}

  for (const name in obj) {
    const cur = obj[name]
    if (!cur) {continue}

    makeRequiredApiIndex(index, cur, '#')
  }

  for (const prop of Object.getOwnPropertySymbols(obj)) {
    const cur = obj[prop]
    makeRequiredApiIndex(index, cur, '#')
  }

  const result = Object.keys(index)

  return result.length ? result : null
}

export default function rebuildEffects(self, effects) {
  self.__api_effects = effects

  self.__api_effects_out = {
    index: indexByDepName(effects) || self.__api_effects_out?.index,
    index_by_triggering: indexByList(effects, 'triggering_states') || self.__api_effects_out?.index_by_triggering,
    index_by_apis: indexByList(effects, 'apis') || self.__api_effects_out?.index_by_apis,
  }



  self.__api_root_dep_apis = rootApis(effects) || self.__api_root_dep_apis || null
}
