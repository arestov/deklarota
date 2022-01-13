import { doesTransactionDisallowEffect } from '../dcl/effects/transaction/inspect'
import checkApisByAttrsChanges from '../dcl/effects/legacy/api/checkApisByAttrsChanges'
import { apiAndConditionsReady } from '../dcl/effects/legacy/produce/isReady'
import getCurrentTransactionKey from '../dcl/effects/legacy/produce/getCurrentTransactionKey'
import justOneAttr from '../dcl/effects/legacy/produce/justOneAttr'
import ensureEffectTask from '../dcl/effects/legacy/produce/ensureEffectTask'
import scheduleTransactionEnd from '../dcl/effects/legacy/produce/scheduleTransactionEnd'
const CH_GR_LE = 2


function scheduleEffect(self, initial_transaction_id, total_original_states, effect, state_name, new_value) {
  const effectAgenda = ensureEffectTask(self, effect, initial_transaction_id)
  const prev = total_original_states.get(state_name)

  if (justOneAttr(effect)) {
    effectAgenda.prev = prev
    effectAgenda.next = new_value
    return effectAgenda
  }

  if (!effectAgenda.prev_values?.hasOwnProperty(state_name)) {
    effectAgenda.prev_values ??= {}
    effectAgenda.prev_values[state_name] = prev
  }

  effectAgenda.next_values ??= {}
  effectAgenda.next_values[state_name] = new_value

  return effectAgenda
}

function disallowedByLoopBreaker(self, effect) {
  return doesTransactionDisallowEffect(self._highway.current_transaction, self, effect)
}


function checkAndMutateInvalidatedEffects(initial_transaction_id, changes_list, total_original_states, self) {
  const index = self.__api_effects_$_index_by_triggering

  for (let i = 0; i < changes_list.length; i += CH_GR_LE) {
    const state_name = changes_list[i]
    if (!index[state_name]) {
      continue
    }
    const list = index[state_name]
    for (let jj = 0; jj < list.length; jj++) {
      const effect = list[jj]
      const ready = apiAndConditionsReady(self, effect)
      if (!ready) {
        continue
      }

      if (disallowedByLoopBreaker(self, list[jj])) {
        continue
      }

      scheduleEffect(self, initial_transaction_id, total_original_states, effect, state_name, changes_list[i + 1])
    }
  }
}


function iterateEffects(initial_transaction_id, changes_list, total_original_states, self) {
  if (!self.__api_effects_$_index) {
    return
  }

  if (self._effects_using_processing == null) {
    self._effects_using_processing = false
  }

  if (self._effects_using_processing) {
    return
  }
  self._effects_using_processing = true

  // changes_list -> invalidated = true
  checkAndMutateInvalidatedEffects(initial_transaction_id, changes_list, total_original_states, self)

  self._effects_using_processing = false
}

export default function(total_ch, total_original_states, self) {
  checkApisByAttrsChanges(total_ch, self)
  const initial_transaction_id = getCurrentTransactionKey(self)

  iterateEffects(initial_transaction_id, total_ch, total_original_states, self)
  scheduleTransactionEnd(self, initial_transaction_id)
}
