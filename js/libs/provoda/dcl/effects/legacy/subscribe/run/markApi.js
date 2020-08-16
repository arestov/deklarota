
// state_name в данном контексте просто key (за исключенимем момента когда нужно вызвать getStateUpdater)

var checkState = function(using, binder) {
  var keys = using.binders.indexes[binder.key]
  var value = true
  for (var i = 0; i < binder.apis.length; i++) {
    if (!keys[binder.apis[i]]) {
      value = false
      break
    }
  }

  using.binders.values[binder.key] = value
  return using
}

var markApi = function(index, using, interface_name, mark) {
  var list = index && index[interface_name]
  if (!list || !list.length) {
    return using
  }

  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    if (!using.binders.indexes[cur.key]) {
      using.binders.indexes[cur.key] = {}
    }
    using.binders.indexes[cur.key][interface_name] = mark
  }

  var result = using
  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    result = checkState(result, cur)
  }
  return result
}

export default markApi
