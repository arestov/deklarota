

export default function(self) {
  if (!self.evcompanion._die_subscribers) {
    return
  }

  const wrapper = self.evcompanion.hndUsualEvCallbacksWrapper

  for (let i = 0; i < self.evcompanion._die_subscribers.length; i++) {
    const cur = self.evcompanion._die_subscribers[i]
    self.evcompanion.callCallback(self, cur, wrapper, null, null, true)
  }

  self.evcompanion._die_subscribers = null

};
