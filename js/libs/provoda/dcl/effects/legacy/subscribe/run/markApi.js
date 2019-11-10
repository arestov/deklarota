define(function() {
'use strict';
// state_name в данном контексте просто key (за исключенимем момента когда нужно вызвать getStateUpdater)

var checkState = function (using, binder) {
  var keys = using.binders.indexes[binder.state_name];
  var value = true;
  for (var i = 0; i < binder.apis.length; i++) {
    if (!keys[binder.apis[i]]) {
      value = false;
      break;
    }
  }

  using.binders.values[binder.state_name] = value;
  return using;
};

var markApi = function (index, using, interface_name, mark) {
  var list = index && index[interface_name];
  if (!list || !list.length) {
    return using;
  }

  for (var i = 0; i < list.length; i++) {
    var cur = list[i];
    if (!using.binders.indexes[cur.state_name]) {
      using.binders.indexes[cur.state_name] = {};
    }
    using.binders.indexes[cur.state_name][interface_name] = mark;
  }

  var result = using;
  for (var i = 0; i < list.length; i++) {
    var cur = list[i];
    result = checkState(result, cur);
  }
  return result;
};

return markApi;
})
