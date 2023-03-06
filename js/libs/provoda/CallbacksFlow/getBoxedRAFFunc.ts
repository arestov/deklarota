import type { TickFn } from './tick.types'

export const getBoxedRAFFunc = function(win: Window | typeof globalThis): TickFn {
  const raf = win.requestAnimationFrame

  return function(fn: () => void): void {
    raf.call(win, fn)
  }
}
