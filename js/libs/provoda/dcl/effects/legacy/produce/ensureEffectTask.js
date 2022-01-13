import { agendaKey } from './getCurrentTransactionKey'
import justOneAttr from './justOneAttr'

function createTask(effect) {
  if (justOneAttr(effect)) {
    return {
      just_one_attr: true, // to help api user understand difference of structure
      prev: null,
      next: null,
      value: null,
    }
  }

  return {
    just_one_attr: false,
    prev_values: null,
    next_values: null,
    values: null,
  }
}

function ensureEffectTask(self, effect, initial_transaction_id) {
  const effect_name = effect.name
  const key = agendaKey(self, initial_transaction_id)
  const schedule = self._highway.__produce_side_effects_schedule
  if (!schedule.get(key)) {
    schedule.set(key, {})
  }

  schedule.get(key)[effect_name] ??= createTask(effect)

  return schedule.get(key)[effect_name]
}

export default ensureEffectTask
