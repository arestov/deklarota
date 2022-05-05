import { FlowStepEffectsTransactionEnd, FlowStepExecEffect } from '../../../../Model/flowStepHandlers.types'
import getCurrentTransactionKey, { agendaKey } from './getCurrentTransactionKey'
import { getOutputFxDcl } from './getOutputFxDcl'
import { apiAndConditionsReady } from './isReady'

export function handleTransactionEnd(self, transaction_key) {
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
    const effect = getOutputFxDcl(self, effect_name)

    // TODO: check that attrs inside effects_schedule[effect_name].prev_values  realy changed
    if (!apiAndConditionsReady(self, effect)) {
      continue
    }


    flow.pushToFlow(
      FlowStepExecEffect,
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
    FlowStepEffectsTransactionEnd
  )
}

export default scheduleTransactionEnd
