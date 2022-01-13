import spv from '../../spv'
import { doesTransactionDisallowEffect } from '../dcl/effects/transaction/inspect'
import checkApisByAttrsChanges from '../dcl/effects/legacy/api/checkApisByAttrsChanges'
import { isEffectApiReady, isEffectConditionReady } from '../dcl/effects/legacy/produce/isReady'
const countKeys = spv.countKeys
const CH_GR_LE = 2

function getCurrentTransactionKey(self) {
  const id = self._currentMotivator()?.complex_order[0]
  if (id) {
    return id
  }
  throw new Error('no id for transaction')
}

function agendaKey(self, initial_transaction_id) {
  return initial_transaction_id + '-' + self.getInstanceKey()
}

function createTask(effect) {
  if (justOneAttr(effect)) {
    return {
      schedule_confirmed: false,
      just_one_attr: true, // to help api user understand difference of structure
      prev: null,
      next: null,
      value: null,
    }
  }

  return {
    schedule_confirmed: false,
    just_one_attr: false,
    prev_values: null,
    next_values: null,
    values: null,
  }
}

function ensureEffectStore(self, effect, initial_transaction_id) {
  const effect_name = effect.name
  const key = agendaKey(self, initial_transaction_id)
  const schedule = self._highway.__produce_side_effects_schedule
  if (!schedule.get(key)) {
    schedule.set(key, {})
  }

  schedule.get(key)[effect_name] ??= createTask(effect)

  return schedule.get(key)[effect_name]
}

function scheduleEffect(self, initial_transaction_id, total_original_states, effect, state_name, new_value) {
  const effectAgenda = ensureEffectStore(self, effect, initial_transaction_id)
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
      if (!isEffectConditionReady(self, effect)) {
        continue
      }

      if (disallowedByLoopBreaker(self, list[jj])) {
        continue
      }

      // mark state
      const task = scheduleEffect(self, initial_transaction_id, total_original_states, effect, state_name, changes_list[i + 1])
      task.schedule_confirmed = apiAndConditionsReady(self, effect)
    }
    // self.__api_effects_$_index_by_triggering[index[state_name].name] = true;
    // self._effects_using.invalidated[index[state_name].name] = true;
  }
}


function apiAndConditionsReady(self, effect) {
  if (!isEffectConditionReady(self, effect)) {
    return false
  }

  if (!isEffectApiReady(self, effect)) {
    return false
  }

  return true
}

function handleEffectResult(self, effect, result) {
  const handle = effect.result_handler
  if (!effect.is_async) {
    if (!handle) {return}
    handle(self, result)
    return
  }

  self.addRequest(result)

  if (!handle) {return}
  result.then(function(result) {
    handle(self, result)
  })

}

function pullTaskAndCleanTransactionAgenda(self, trans_store, effect_name, key) {
  delete trans_store[effect_name]
  if (!countKeys(trans_store)) {
    self._highway.__produce_side_effects_schedule.delete(key)
  }
}

function justOneAttr(effect) {
  return effect.triggering_states.length == 1
}

function ensureTaskValues(self, effect, task) {
  const just_one_attr = justOneAttr(effect)
  if (just_one_attr) {
    task.value = self.getAttr(effect.triggering_states[0])
    return
  }

  if (task.next_values != null) {
    task.values = task.next_values
    return
  }

  task.values = {}
  for (let jj = 0; jj < effect.triggering_states.length; jj++) {
    const attr_name = effect.triggering_states[jj]
    task.values[attr_name] = self.getAttr(attr_name)
  }
}

function executeEffect(self, effect_name, transaction_id) {
  const key = agendaKey(self, transaction_id)
  const trans_store = self._highway.__produce_side_effects_schedule.get(key)

  const task = trans_store && trans_store[effect_name]

  pullTaskAndCleanTransactionAgenda(self, trans_store, effect_name, key)

  if (!task) {
    return
  }



  const effect = self.__api_effects[effect_name]

  const args = new Array(effect.apis.length + effect.triggering_states.length)
  for (let i = 0; i < effect.apis.length; i++) {
    const api = self._interfaces_used[effect.apis[i]]
    if (!api) {
      // do not call effect fn
      return
    }
    args[i] = api
  }

  ensureTaskValues(self, effect, task)

  args[effect.apis.length] = task

  const result = effect.fn.apply(null, args)
  handleEffectResult(self, effect, result)
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

function scheduleTransactionEnd(self, transaction_key) {
  if (self._highway.__produce_side_effects_schedule == null) {
    return
  }

  const calls_flow = self._getCallsFlow()

  const tid = getCurrentTransactionKey(self)
  const key = agendaKey(self, transaction_key)

  if (!self._highway.__produce_side_effects_schedule.has(key)) {
    return
  }

  calls_flow.scheduleTransactionEnd(
    tid ? tid : Infinity,
    null,
    [self, transaction_key],
    handleTransactionEnd
  )
}

function handleTransactionEnd(self, transaction_key) {
  const key = agendaKey(self, transaction_key)

  if (!self._highway.__produce_side_effects_schedule.has(key)) {
    return
  }

  const flow = self._getCallsFlow()
  const tkey = transaction_key

  const effects_schedule = self._highway.__produce_side_effects_schedule.get(key)
  for (const effect_name in effects_schedule) {
    if (!effects_schedule.hasOwnProperty(effect_name)) {
      continue
    }
    const cur = effects_schedule[effect_name]
    if (!cur.schedule_confirmed) {
      continue
    }

    flow.pushToFlow(
      executeEffect,
      self,
      [self, effect_name, tkey],
      null,
      null,
      null,
      self._currentMotivator()
    )

  }

  flow.pushToFlow(
    eraseTransactionEffectsData,
    null,
    [self, key],
    null,
    null,
    null,
    self._currentMotivator()
  )


}

function eraseTransactionEffectsData(self, key) {
  self._highway.__produce_side_effects_schedule.delete(key)
}
