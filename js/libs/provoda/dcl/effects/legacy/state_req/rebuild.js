

import changeSources from '../utils/changeSources'

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


export default function buildStateReqs(self, list) {
  self._states_reqs_list = list

  const _states_reqs_index = {}
  const uniq_states = new Set()
  for (let i = 0; i < list.length; i++) {
    const states_list = list[i].states_list
    for (let jj = 0; jj < states_list.length; jj++) {
      uniq_states.add(states_list[jj])
    }
  }
  for (const state_name of uniq_states) {
    _states_reqs_index[state_name] = doIndex(list, state_name)
  }
  self._states_reqs_index = _states_reqs_index

  const netsources_of_states = {
    api_names: [],
    api_names_converted: false,
    sources_names: []
  }

  for (let i = 0; i < list.length; i++) {
    changeSources(netsources_of_states, list[i].send_declr)

    // copy dependencies to comp, so runtime will subscribe to nonlocal changes
    // (todo: subscribe to nonlocal deps without mutating comp)
  }

  self.netsources_of_states = netsources_of_states
}
