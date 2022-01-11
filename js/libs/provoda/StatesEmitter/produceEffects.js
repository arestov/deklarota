import spv from '../../spv'
import { doesTransactionDisallowEffect } from '../dcl/effects/transaction/inspect'
const countKeys = spv.countKeys
const CH_GR_LE = 2

function checkAndMutateCondReadyEffects(changes_list, self) {
  const index = self.__api_effects_$_index

  for (let i = 0; i < changes_list.length; i += CH_GR_LE) {
    const state_name = changes_list[i]
    if (!index[state_name]) {continue}

    const value = changes_list[i + 1]

    self._effects_using.conditions_ready[index[state_name].name] = Boolean(value)
  }
}

function getCurrentTransactionId(self) {
  const current_motivator = self._currentMotivator()
  const id = current_motivator && current_motivator.complex_order[0]
  if (id) {
    return id
  }
}

function getCurrentTransactionKey(self) {
  const id = getCurrentTransactionId(self)
  if (id) {
    return id
  }
  throw new Error('no id for transaction')
}

function agendaKey(self, initial_transaction_id) {
  return initial_transaction_id + '-' + self.getInstanceKey()
}

function ensureEffectStore(self, effect_name, initial_transaction_id) {
  const key = agendaKey(self, initial_transaction_id)
  if (!self._highway.__produce_side_effects_schedule.get(key)) {
    self._highway.__produce_side_effects_schedule.set(key, {})
  }

  if (!self._highway.__produce_side_effects_schedule.get(key)[effect_name]) {
    self._highway.__produce_side_effects_schedule.get(key)[effect_name] = {
      prev_values: {},
      next_values: {},
    }
  }

  return self._highway.__produce_side_effects_schedule.get(key)[effect_name]
}

function scheduleEffect(self, initial_transaction_id, total_original_states, effect_name, state_name, new_value, skip_prev) {
  const effectAgenda = ensureEffectStore(self, effect_name, initial_transaction_id)
  if (!skip_prev && !effectAgenda.prev_values.hasOwnProperty(state_name)) {
    effectAgenda.prev_values[state_name] = total_original_states.get(state_name)
  }

  effectAgenda.next_values[state_name] = new_value
}

function disallowedByLoopBreaker(self, effect) {
  return doesTransactionDisallowEffect(self._highway.current_transaction, self, effect)
}

function checkAndMutateInvalidatedEffects(initial_transaction_id, changes_list, total_original_states, self) {
  const index = self.__api_effects_$_index_by_triggering
  const using = self._effects_using

  for (let i = 0; i < changes_list.length; i += CH_GR_LE) {
    const state_name = changes_list[i]
    if (!index[state_name]) {
      continue
    }
    const list = index[state_name]
    for (let jj = 0; jj < list.length; jj++) {
      const effect_name = list[jj].name
      if (!using.conditions_ready[effect_name]) {
        continue
      }

      if (disallowedByLoopBreaker(self, list[jj])) {
        continue
      }

      // mark state
      scheduleEffect(self, initial_transaction_id, total_original_states, list[jj].name, state_name, changes_list[i + 1], false)
      self._effects_using.invalidated[list[jj].name] = true
      // mark to recheck
    }
    // self.__api_effects_$_index_by_triggering[index[state_name].name] = true;
    // self._effects_using.invalidated[index[state_name].name] = true;
  }
}

function prefillAgenda(self, initial_transaction_id, total_original_states, effect_name, effect) {
  for (let i = 0; i < effect.triggering_states.length; i++) {
    const state_name = effect.triggering_states[i]
    scheduleEffect(self, initial_transaction_id, total_original_states, effect_name, state_name, self.getAttr(state_name), true)

  }
}

function apiAndConditionsReady(self, using, effect, effect_name) {
  if (effect.deps && !using.conditions_ready[effect_name]) {
    return false
  }

  for (let cc = 0; cc < effect.apis.length; cc++) {
    const api = effect.apis[cc]

    if (!self._interfaces_used[api]) {
      return false
    }
  }

  return true
}

function confirmReady(self, initial_transaction_id, effect_name) {
  const using = self._effects_using

  // we can push anytimes we want
  // 1st handler will erase agenda, so effects will be called just 1 time

  const effectAgenda = ensureEffectStore(self, effect_name, initial_transaction_id)
  effectAgenda.schedule_confirmed = true

  using.invalidated[effect_name] = false
  using.dep_effects_ready[effect_name] = false
  using.once[effect_name] = true
}

function onReady(self, initial_transaction_id, total_original_states, effect_name, effect) {
  prefillAgenda(self, initial_transaction_id, total_original_states, effect_name, effect)
  confirmReady(self, initial_transaction_id, effect_name)
}

function checkAndMutateDepReadyEffects(self, initial_transaction_id, total_original_states) {
  const using = self._effects_using
  const effects = self.__api_effects

  // маркировать готовые
  /*
    у которых не готовы зависимости - те не готовы
    выполнять готовых
    повторить проверку
    повторить выполнение
    повторять до упора

  */
  using.dep_effects_ready_is_empty = true

  let has_one_became_ready = false

  for (const effect_name in using.invalidated) {
    if (!using.invalidated[effect_name]) {
      continue
    }

    const effect = effects[effect_name]

    const deps_ready = apiAndConditionsReady(self, using, effect, effect_name)
    using.dep_effects_ready[effect_name] = deps_ready

    if (!deps_ready) {
      continue
    }

    onReady(self, initial_transaction_id, total_original_states, effect_name, effect)
    has_one_became_ready = true

  }
  using.dep_effects_ready_is_empty = using.dep_effects_ready_is_empty && !has_one_became_ready
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

function getValue(self, agenda, state_name) {
  if (agenda.next_values.hasOwnProperty(state_name)) {
    return agenda.next_values[state_name]
  }

  return self.getAttr(self, state_name)
}

function pullTaskAndCleanTransactionAgenda(self, trans_store, effect_name, key) {
  delete trans_store[effect_name]
  if (!countKeys(trans_store)) {
    self._highway.__produce_side_effects_schedule.delete(key)
  }
}

function executeEffect(self, effect_name, transaction_id) {
  const key = agendaKey(self, transaction_id)
  const trans_store = self._highway.__produce_side_effects_schedule.get(key)

  const agenda = trans_store && trans_store[effect_name]

  pullTaskAndCleanTransactionAgenda(self, trans_store, effect_name, key)

  if (!agenda) {
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
  for (let jj = 0; jj < effect.triggering_states.length; jj++) {
    args[effect.apis.length + jj] = getValue(self, agenda, effect.triggering_states[jj])
  }

  const result = effect.fn.apply(null, args)
  handleEffectResult(self, effect, result)
}

function iterateEffects(initial_transaction_id, changes_list, total_original_states, self) {
  if (!self.__api_effects_$_index) {
    return
  }

  if (!self._effects_using) {
    self._effects_using = {
      processing: false,
      conditions_ready: {},
      invalidated: {},
      once: {},
      dep_effects_ready: {},
      dep_effects_ready_is_empty: true
    }
  }

  if (self._effects_using.processing) {
    return
  }
  self._effects_using.processing = true

  checkAndMutateCondReadyEffects(changes_list, self)
  // changes_list -> invalidated = true
  checkAndMutateInvalidatedEffects(initial_transaction_id, changes_list, total_original_states, self)

  // invalidated -> confirm, invalidated = false
  checkAndMutateDepReadyEffects(self, initial_transaction_id, total_original_states)

  self._effects_using.processing = false
}

function checkApi(declr, value, self) {
  if (!value) {
    self.useInterface(declr.name, null, declr.destroy)
    return
  }

  if (!declr.needed_apis) {
    self.useInterface(declr.name, declr.fn())
    return
  }

  const args = new Array(declr.needed_apis.length)
  for (let i = 0; i < declr.needed_apis.length; i++) {
    args[i] = self._interfaces_used[declr.needed_apis[i]]
  }

  self.useInterface(declr.name, declr.fn.apply(null, args))

}

function iterateApis(changes_list, context) {
  //index by uniq
  const index = context.__apis_$_index
  if (!index) {
    return
  }

  for (let i = 0; i < changes_list.length; i += CH_GR_LE) {
    const state_name = changes_list[i]
    if (!index[state_name]) {
      continue
    }

    checkApi(index[state_name], changes_list[i + 1], context)
  }
}


export default function(total_ch, total_original_states, self) {
  iterateApis(total_ch, self)
  const initial_transaction_id = getCurrentTransactionKey(self)

  iterateEffects(initial_transaction_id, total_ch, total_original_states, self)
  scheduleTransactionEnd(self, initial_transaction_id)
}

function scheduleTransactionEnd(self, transaction_key) {
  if (self._highway.__produce_side_effects_schedule == null) {
    return
  }

  const calls_flow = self._getCallsFlow()

  const tid = getCurrentTransactionId(self)
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
