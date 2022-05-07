
// state_name в данном контексте просто key (за исключенимем момента когда нужно вызвать getStateUpdater)

const checkState = function(binders, binder) {
  const keys = binders.indexes[binder.key]
  let value = true
  for (let i = 0; i < binder.apis.length; i++) {
    if (!keys[binder.apis[i]]) {
      value = false
      break
    }
  }

  binders.values[binder.key] = value
  return binders
}

const markApi = function(index, binders, interface_name, mark) {
  const list = index && index[interface_name]
  if (!list || !list.length) {
    return binders
  }

  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    if (!binders.indexes[cur.key]) {
      binders.indexes[cur.key] = {}
    }
    // mark current api for each dependant api
    binders.indexes[cur.key][interface_name] = mark
  }

  let result = binders
  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    // calc final value for list of deps
    result = checkState(result, cur)
  }
  return result
}

export default markApi
