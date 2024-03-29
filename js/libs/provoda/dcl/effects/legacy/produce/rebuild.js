
import spv from '../../../../../spv'
import { fxByNameP } from '../../fxP'
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

export const __api_effects_out = [
  ['__api_effects'],
  (effects) => {
    return {
      index: indexByDepName(effects),
      index_by_triggering: indexByList(effects, 'triggering_states'),
      index_by_apis: indexByList(effects, 'apis'),
    }
  },
]

export const __api_root_dep_apis = [
  [
  /*
  we don't need both effects from user and from dkt ('__api_effects')
  we need only from user fxByNameP('produce-')
  sinse dkt effects don't use root apis
  */
    fxByNameP('produce-'),
  ],
  (effects) => {
    return rootApis(effects)
  }
]

