

export default function(self) {
  if (!self._die_subscribers) {
    return
  }

  const wrapper = null

  for (let i = 0; i < self._die_subscribers.length; i++) {
    const cur = self._die_subscribers[i]
    self.callCallback(self, cur, wrapper, null, null, true)
  }

  self._die_subscribers = null

};
