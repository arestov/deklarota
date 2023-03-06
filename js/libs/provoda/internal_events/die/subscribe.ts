import type { DieHolder } from './die.types'

export default function subscribeToDie(
  self: DieHolder,
  cb: (_arg: unknown) => void
): void {
  if (!self._die_subscribers) {
    self._die_subscribers = []
  }

  self._die_subscribers.push(cb)
}
