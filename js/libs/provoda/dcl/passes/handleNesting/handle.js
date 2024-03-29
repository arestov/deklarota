
// etr, original_states, state_name, value

import { FlowStepAction } from '../../../Model/flowStepHandlers.types'

export default function(self, state_name, old_value, value) {
  if (!self.$actions$handle_rel || !self.$actions$handle_rel[state_name]) {
    return
  }

  const pass_name = self.$actions$handle_rel[state_name].name

  const arg = {
    next_value: value,
    prev_value: old_value,
  }

  self.nextLocalTick(FlowStepAction, [self, pass_name, arg], true)
};
