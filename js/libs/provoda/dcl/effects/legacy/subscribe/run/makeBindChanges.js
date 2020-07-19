define(function(require) {
'use strict'
var _updateAttr = require('_updateAttr');

var saveResult = require('../../../../passes/targetedResult/save.js')

// state_name в данном контексте просто key (за исключенимем момента когда нужно вызвать getStateUpdater)

var ensureHandler = function(fn, use_input) {
  return function(em, dcl, exactPart) {
    if (!em._highway._subscribe_effect_handlers) {
      em._highway._subscribe_effect_handlers  = {}
    }

    var store = em._highway._subscribe_effect_handlers

    var key = em.getInstanceKey() + '-' + dcl.id

    if (store[key]) {
      return store[key]
    }

    store[key] = use_input !== false ?
      em.inputFn(function(value) {
        fn(this, exactPart, value)
      })
      : function(value) {
        fn(em, exactPart, value)
      };

    return store[key]
  }
}

var getStateUpdater = ensureHandler(function(em, state_name, value) {
  _updateAttr(em, state_name, value);
})

var getPassDispatcher = ensureHandler(function(em, pass_name, data) {
  em.__act(em, pass_name, data);
})

var getTargetedResultSaver = ensureHandler(function(em, dcl, data) {
  saveResult(em, dcl, data, data)
})

var getRemoteHandler = ensureHandler(function(em, dcl, data) {
  if (dcl.targeted_result) {
    throw new Error('unsupported')
  }
  if (dcl.pass_name) {
    em.RPCLegacy('dispatch', dcl.pass_name, data)
    return
  }

  if (dcl.state_name) {
    em.RPCLegacy('updateAttr', dcl.state_name, data)
    return
  }
}, false)


var getHandler = function(self, dcl) {
  if (dcl.remote) {
    return getRemoteHandler(self, dcl, dcl)
  }

  if (dcl.pass_name) {
    return getPassDispatcher(self, dcl, dcl.pass_name)
  }

  if (dcl.targeted_result) {
    return getTargetedResultSaver(self, dcl, dcl)
  }

  return getStateUpdater(self, dcl, dcl.state_name);
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
