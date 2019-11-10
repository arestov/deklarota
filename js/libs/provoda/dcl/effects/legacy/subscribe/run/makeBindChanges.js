define(function() {
'use strict'
// state_name в данном контексте просто key (за исключенимем момента когда нужно вызвать getStateUpdater)

var getStateUpdater = function(em, state_name) {
  if (!em._state_updaters) {
    em._state_updaters = {};
  }
  if (!em._state_updaters.hasOwnProperty(state_name)) {
    em._state_updaters[state_name] = function(value) {
      em.updateState(state_name, value);
    };
  }
  return em._state_updaters[state_name];
};


var makeBindChanges = function (self, index, using, original_values) {
  // _build_cache_interfaces
  for (var state_name in using.binders.values) {
    var change = Boolean(original_values[state_name]) != Boolean(using.binders.values[state_name]);
    if (!change) {
      continue;
    }

    var cur = index[state_name];

    if (using.binders.values[state_name]) {
      var apis = cur.apis;
      var bind_args = new Array(apis.length + 1);

      bind_args[0] = getStateUpdater(self, cur.state_name);
      for (var i = 0; i < apis.length; i++) {
        bind_args[i + 1] = using.used[apis[i]];
      }
      using.binders.removers[state_name] = cur.fn.apply(null, bind_args);
    } else {
      using.binders.removers[state_name].call();
      using.binders.removers[state_name] = null;
    }
  }

  return using;
};

return makeBindChanges
})
