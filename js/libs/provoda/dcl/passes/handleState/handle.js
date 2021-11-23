
// etr, original_states, state_name, value

export default function(self, original_states, state_name, value) {
  if (self.__handleState == null || self.__handleState[state_name] == null) {
    return
  }

  const pass_name = self.__handleState[state_name].name

  const old_value = original_states.get(state_name)
  const arg = {
    next_value: value,
    prev_value: old_value,
  }

  self.nextLocalTick(self.__act, [self, pass_name, arg], true)
};
