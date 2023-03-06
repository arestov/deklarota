import type { DieHolder } from './die.types'


export default function(self: DieHolder): void {
  self._die_subscribers = null
};
