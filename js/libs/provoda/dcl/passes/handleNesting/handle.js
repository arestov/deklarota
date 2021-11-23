
// etr, original_states, state_name, value

export default function(self, state_name, old_value, value) {
  if (!self.__handleNesting || !self.__handleNesting[state_name]) {
    return
  }

  const pass_name = self.__handleNesting[state_name].name

  const arg = {
    next_value: value,
    prev_value: old_value,
  }

  self.nextLocalTick(self.__act, [self, pass_name, arg], true)
};
