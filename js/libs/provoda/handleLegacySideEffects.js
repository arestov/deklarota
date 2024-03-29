import { FlowStepLegacyStch } from './Model/flowStepHandlers.types'


const CH_GR_LE = 2

function getStateChangeEffect(target, state_name) {
  if (target.__state_change_index == null) {
    return null
  }

  if (!target.__state_change_index.hasOwnProperty(state_name)) {
    return null
  }
  return target.__state_change_index[state_name]
}

export function proxyStch(target, state_name, value, old_value) {

  const method = getStateChangeEffect(target, state_name)

  method(target, value, old_value)
}

function _handleStch(etr, state_name, value, old_value) {
  const method = getStateChangeEffect(etr, state_name)
  if (method == null) {
    return
  }

  etr.nextLocalTick(FlowStepLegacyStch, [etr, state_name, value, old_value], true, method.finup)
}

export default function handleLegacySideEffects(etr, total_original_states, changes_list, start_from, inputLength) {
  if (etr.__syncStatesChanges != null || etr.__handleHookedSync != null) {
    const to_send = changes_list.slice(start_from, inputLength)
    if (etr.__syncStatesChanges != null) {
      etr.__syncStatesChanges.call(null, etr, to_send, etr.states)
    }

    if (etr.__handleHookedSync != null) {
      etr.__handleHookedSync.call(null, etr, to_send, etr.states)
    }
  }

  for (let i = start_from; i < inputLength; i += CH_GR_LE) {
    _handleStch(etr, changes_list[i], changes_list[i + 1], total_original_states.get(changes_list[i]))
  }
}
