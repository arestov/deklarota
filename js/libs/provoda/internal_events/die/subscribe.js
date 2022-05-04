

export default function subscribeToDie(self, cb) {

  if (!self._die_subscribers) {
    self._die_subscribers = []
  }

  self._die_subscribers.push(cb)
};
