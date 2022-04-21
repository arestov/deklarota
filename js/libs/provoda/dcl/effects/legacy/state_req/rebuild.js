

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
  self._states_reqs_index = {}
  self._states_reqs_list = list
  const states_index = {}

  for (let i = 0; i < list.length; i++) {
    const states_list = list[i].states_list
    for (let jj = 0; jj < states_list.length; jj++) {
      states_index[states_list[jj]] = true
    }
  }
  for (const state_name in states_index) {
    self._states_reqs_index[state_name] = doIndex(list, state_name)
  }

  self.netsources_of_states = {
    api_names: [],
    api_names_converted: false,
    sources_names: []
  }

  for (let i = 0; i < list.length; i++) {
    changeSources(self.netsources_of_states, list[i].send_declr)

    // copy dependencies to comp, so runtime will subscribe to nonlocal changes
    // (todo: subscribe to nonlocal deps without mutating comp)
  }
}
