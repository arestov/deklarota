

export default function subscribeToDie(self, cb) {

  if (!self.evcompanion._die_subscribers) {
    self.evcompanion._die_subscribers = []
  }

  self.evcompanion._die_subscribers.push(cb)
};
