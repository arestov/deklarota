define(function() {
'use strict'

return function(self) {
  if (!self.evcompanion._die_subscribers) {
    return
  }

  var wrapper = self.evcompanion.hndUsualEvCallbacksWrapper

  for (var i = 0; i < self.evcompanion._die_subscribers.length; i++) {
    var cur = self.evcompanion._die_subscribers[i]
    self.evcompanion.callCallback(self, cur, wrapper, null, null, true)
  }

  self.evcompanion._die_subscribers = null

}

})
