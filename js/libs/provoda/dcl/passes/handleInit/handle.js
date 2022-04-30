
// etr, original_states, state_name, value

export default function(self, data) {
  if (!self.$actions$handleInit) {
    return
  }

  const pass_name = self.$actions$handleInit.name

  const arg = data

  self.nextLocalTick(self.__act, [self, pass_name, arg], true)
};
