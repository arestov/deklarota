import ensureEffectTask from './ensureEffectTask'
import getCurrentTransactionKey from './getCurrentTransactionKey'
import { apiAndConditionsReady } from './isReady'
import scheduleTransactionEnd from './scheduleTransactionEnd'

function doesApiWantTaskBeCreated(self, effect) {
  let result = null
  for (let cc = 0; cc < effect.apis.length; cc++) {
    const api_name = effect.apis[cc]
    const api = self.getInterface(api_name)

    const value = api.create_task_when_api_inits

    if (value == null) {
      console.warn('add create_when.api_inits param to effect or create_task_when_api_inits to api', effect)
      throw new Error('nullish value for create_task_when_api_inits')
    }

    if (cc == 0) {
      result = value
      continue
    }

    const prev_api = effect.apis[cc - 1]

    if (prev_api.create_task_when_api_inits !== value) {
      console.warn('change create_task_when_api_inits to same value for all apis or add create_when.api_inits param to effect', effect)
      throw new Error('multiple values for create_task_when_api_inits')
    }
  }

  return result
}

function createTaskByInitedApi(self, effect) {
  const initial_transaction_id = getCurrentTransactionKey(self)
  const task = ensureEffectTask(self, effect, initial_transaction_id)
  task.created_by_inited_api = true
}

function checkEffect(self, effect) {
  const create_task_when_api_inits = effect.create_when_api_inits ?? doesApiWantTaskBeCreated(self, effect)

  if (create_task_when_api_inits === false) {
    return
  }

  if (!apiAndConditionsReady(self, effect)) {
    return
  }

  createTaskByInitedApi(self, effect)
}

function checkInitedApi(self, api_name) {
  const effects_to_check = self.__api_effects_out?.index_by_apis?.[api_name]
  if (effects_to_check == null) {return}

  for (let i = 0; i < effects_to_check.length; i++) {
    const dcl = effects_to_check[i]
    checkEffect(self, dcl)
  }

  scheduleTransactionEnd(self, getCurrentTransactionKey(self))
}


export default checkInitedApi
