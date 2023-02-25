export const getBoxedRAFFunc = function(win) {
  let raf

  if (win.requestAnimationFrame) {
    raf = win.requestAnimationFrame
  } else {
    const vendors = ['ms', 'moz', 'webkit', 'o']
    for (let x = 0; x < vendors.length && !raf; ++x) {
      raf = win[vendors[x] + 'RequestAnimationFrame']
    }
  }
  return raf && function(fn) {
    return raf.call(win, fn)
  }
}
