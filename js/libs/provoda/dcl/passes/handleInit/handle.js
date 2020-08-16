
// etr, original_states, state_name, value

export default function(self, data) {
  if (!self.__handleInit) {
    return
  }

  var pass_name = self.__handleInit.name

  var arg = data

  self.nextLocalTick(self.__act, [self, pass_name, arg], true)
};
