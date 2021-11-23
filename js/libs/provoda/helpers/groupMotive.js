

export default function(fn) {
  return function() {
    const self = this
    const need = !this._currentMotivator()
    if (!need) {
      return fn.apply(self, arguments)
    }

    const flow = self._getCallsFlow()
    const motivator = flow.startGroup()
    self.current_motivator = motivator
    const result = fn.apply(self, arguments)
    flow.completeGroup(motivator)
    self.current_motivator = null
    flow.checkCallbacksFlow()
    return result
  }
};
