define(function() {
'use strict'
// state_name в данном контексте просто key (за исключенимем момента когда нужно вызвать getStateUpdater)

var getStateUpdater = function(em, state_name) {
  if (!em._state_updaters) {
    em._state_updaters = {};
  }
  if (!em._state_updaters.hasOwnProperty(state_name)) {
    em._state_updaters[state_name] = em.inputFn(function(value) {
      em.updateState(state_name, value);
    });
  }
  return em._state_updaters[state_name];
};

var getHandler = function(self, dcl) {
  return getStateUpdater(self, dcl.state_name);
}


var makeBindChanges = function (self, index, using, original_values) {
  // _build_cache_interfaces
  for (var key in using.binders.values) {
    var change = Boolean(original_values[key]) != Boolean(using.binders.values[key]);
    if (!change) {
      continue;
    }

    var cur = index[key];

    if (using.binders.values[key]) {
      var apis = cur.apis;
      var bind_args = new Array(apis.length + 1);

      bind_args[0] = getHandler(self, cur)
      for (var i = 0; i < apis.length; i++) {
        bind_args[i + 1] = using.used[apis[i]];
      }
      using.binders.removers[key] = cur.fn.apply(null, bind_args);
    } else {
      using.binders.removers[key].call();
      using.binders.removers[key] = null;
    }
  }

  return using;
};

return makeBindChanges
})
