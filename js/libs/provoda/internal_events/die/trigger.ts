import type { DieHolder } from './die.types'

type DieHolderWithCaller = DieHolder & {
  callCallback: (_arg: unknown, _arg2: unknown, _arg3: unknown, _arg4: unknown, _arg5: unknown, _arg6: unknown) => void,
}

export default function(self: DieHolderWithCaller): void {
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
