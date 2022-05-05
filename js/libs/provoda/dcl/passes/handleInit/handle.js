
// etr, original_states, state_name, value

import { FlowStepAction } from '../../../Model/flowStepHandlers.types'

export default function(self, data) {
  if (!self.$actions$handleInit) {
    return
  }

  const pass_name = self.$actions$handleInit.name

  const arg = data

  self.nextLocalTick(FlowStepAction, [self, pass_name, arg], true)
};
