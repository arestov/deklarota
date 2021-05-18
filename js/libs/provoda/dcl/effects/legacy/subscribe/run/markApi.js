
// state_name в данном контексте просто key (за исключенимем момента когда нужно вызвать getStateUpdater)

var checkState = function(binders, binder) {
  var keys = binders.indexes[binder.key]
  var value = true
  for (var i = 0; i < binder.apis.length; i++) {
    if (!keys[binder.apis[i]]) {
      value = false
      break
    }
  }

  binders.values[binder.key] = value
  return binders
}

var markApi = function(index, binders, interface_name, mark) {
  var list = index && index[interface_name]
  if (!list || !list.length) {
    return binders
  }

  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    if (!binders.indexes[cur.key]) {
      binders.indexes[cur.key] = {}
    }
    binders.indexes[cur.key][interface_name] = mark
  }

  var result = binders
  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    result = checkState(result, cur)
  }
  return result
}

export default markApi
