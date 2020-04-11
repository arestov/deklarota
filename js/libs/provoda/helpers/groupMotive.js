define(function() {
'use strict'
return function(fn) {
  return function() {
    var self = this;
    var need = !this._currentMotivator();
    if (!need) {
      return fn.apply(self, arguments);
    }

    var flow = self._getCallsFlow()
    var motivator = flow.startGroup();
    self.current_motivator = motivator
    var result = fn.apply(self, arguments);
    flow.completeGroup(motivator)
    self.current_motivator = null;
    flow.checkCallbacksFlow()
    return result;
  };
}
})
