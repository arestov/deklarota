import type { TickFn } from './tick.types'

export const getBoxedRAFFunc = function(win: Window): TickFn {
  const raf = win.requestAnimationFrame

  return function(fn: () => void): void {
    raf.call(win, fn)
  }
}
