export const getBoxedSetImmFunc = function(win, onError) {
  const prom = win.Promise.resolve()

  const handle = function(err) {
    if (!onError) {
      throw new Error('add onError handler for runtime')
    }

    onError(err)
  }

  return function(fn) {
    prom.then(fn).catch(handle)
  }
}
