import type { TickFn } from './tick.types'

export const getBoxedSetImmFunc = function(_win: unknown, onError: (_err: Error) => void): TickFn {
  const prom = Promise.resolve()

  const handle = function(err: Error): void {
    if (!onError) {
      throw new Error('add onError handler for runtime')
    }

    onError(err)
  }

  return function(fn: () => void) {
    prom.then(fn).catch(handle)
  }
}
