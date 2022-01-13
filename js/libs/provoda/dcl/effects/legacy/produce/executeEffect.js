import { countKeys } from '../../../../../spv'
import { agendaKey } from './getCurrentTransactionKey'
import justOneAttr from './justOneAttr'

function pullTaskAndCleanTransactionAgenda(self, trans_store, effect_name, key) {
  delete trans_store[effect_name]
  if (!countKeys(trans_store)) {
    self._highway.__produce_side_effects_schedule.delete(key)
  }
}

function ensureTaskValues(self, effect, task) {
  const just_one_attr = justOneAttr(effect)
  if (just_one_attr) {
    task.value = self.getAttr(effect.triggering_states[0])
    return
  }

  if (!task.created_by_inited_api && !task.create_when_becomes_ready && task.next_values != null) {
    task.values = task.next_values
    return
  }

  task.values = {}
  for (let jj = 0; jj < effect.triggering_states.length; jj++) {
    const attr_name = effect.triggering_states[jj]
    task.values[attr_name] = self.getAttr(attr_name)
  }
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


export default executeEffect
