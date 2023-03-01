export const initRuntimeInputFns = (runtimeHighway) => {
  runtimeHighway.input_from_interface_fns = new Map()
  runtimeHighway.input_from_interface_fns_counter = 0
}

export const pushRuntimeInputFn = (model, fn) => {
  const runtimeHighway = model._highway
  const num = runtimeHighway.input_from_interface_fns_counter++
  runtimeHighway.input_from_interface_fns.set(num, fn)
  return num
}

export const popRuntimeInputFn = (model, num) => {
  const runtimeHighway = model._highway
  const fn = runtimeHighway.input_from_interface_fns.get(num)

  runtimeHighway.input_from_interface_fns.delete(num)
  return fn
}
