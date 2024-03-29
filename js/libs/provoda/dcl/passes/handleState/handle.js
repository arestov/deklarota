
// etr, original_states, state_name, value

import { FlowStepAction } from '../../../Model/flowStepHandlers.types'

export default function(self, original_states, state_name, value) {
  if (self.$actions$handle_attr == null || self.$actions$handle_attr[state_name] == null) {
    return
  }

  const pass_name = self.$actions$handle_attr[state_name].name

  const old_value = original_states.get(state_name)
  const arg = {
    next_value: value,
    prev_value: old_value,
  }

  self.nextLocalTick(FlowStepAction, [self, pass_name, arg], true)
};
