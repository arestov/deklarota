

import assign from '../utils/assign'
import changeSources from '../utils/changeSources'
import parseCompItems from '../../../attrs/comp/parseItems'

const doIndex = function(list, value) {
  const result = []

  for (let i = 0; i < list.length; i++) {
    const states_list = list[i].states_list
    if (states_list.indexOf(value) != -1) {
      result.push(list[i])
    }
  }

  return result
}

export const _states_reqs_index = [
  ['_states_reqs_list'],
  (list) => {
    const result = {}
    const uniq_states = new Set()
    for (let i = 0; i < list.length; i++) {
      const states_list = list[i].states_list
      for (let jj = 0; jj < states_list.length; jj++) {
        uniq_states.add(states_list[jj])
      }
    }
    for (const state_name of uniq_states) {
      result[state_name] = doIndex(list, state_name)
    }
    return result
  }
]

export const netsources_of_states = [
  ['_states_reqs_list'],
  (list) => {
    const result = {
      api_names: [],
      api_names_converted: false,
      sources_names: []
    }

    for (let i = 0; i < list.length; i++) {
      changeSources(result, list[i].send_declr)

      // copy dependencies to comp, so runtime will subscribe to nonlocal changes
      // (todo: subscribe to nonlocal deps without mutating comp)
    }

    return result
  }
]

export const ___dcl_eff_consume_req_st = [
  ['_states_reqs_list'],
  (list) => {
    const uniq_names = new Set()

    const extended_comp_attrs = {}
    for (let i = 0; i < list.length; i++) {
      const cur = list[i]
      if (uniq_names.has(cur.name)) {
        console.error('attr request name should be uniq (for migrations): ', {name: cur.name})
        throw new Error('attr request name should be uniq')
      }
      uniq_names.add(cur.name, true)

      assign(extended_comp_attrs, cur)
    }
    parseCompItems(extended_comp_attrs)
    return extended_comp_attrs
  }
]

