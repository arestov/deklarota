
import _updateAttr from '../../../../../_internal/_updateAttr'
import saveResult from '../../../../passes/targetedResult/save.js'

// state_name в данном контексте просто key (за исключенимем момента когда нужно вызвать getStateUpdater)

const getCacheStore = (em) => {
  if (!em._highway._subscribe_effect_handlers) {
    em._highway._subscribe_effect_handlers = {}
  }

  var store = em._highway._subscribe_effect_handlers
  return store
}

const getCacheValue = (em, dcl) => {
  const key = em.getInstanceKey() + '-' + dcl.id
  const store = getCacheStore(em, dcl)
  return store[key]
}

const setCacheValue = (em, dcl, value) => {
  const key = em.getInstanceKey() + '-' + dcl.id
  const store = getCacheStore(em, dcl)
  store[key] = value
}

var ensureHandler = function(fn, use_input) {
  return function(em, dcl, exactPart) {
    const value = getCacheValue(em, dcl)
    if (value) {return value}

    const newValue = use_input !== false ?
      em.inputFn(function(value) {
        fn(this, exactPart, value)
      })
      : function(value) {
        fn(em, exactPart, value)
      }

    setCacheValue(em, dcl, newValue)

    return newValue
  }
}

var getStateUpdater = ensureHandler(function(em, state_name, value) {
  _updateAttr(em, state_name, value)
})

var getPassDispatcher = ensureHandler(function(em, pass_name, data) {
  em.__act(em, pass_name, data)
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

  return getStateUpdater(self, dcl, dcl.state_name)
}


var makeBindChanges = function(self, index, binders, original_values) {
  // _build_cache_interfaces
  for (var key in binders.values) {
    var change = Boolean(original_values[key]) != Boolean(binders.values[key])
    if (!change) {
      continue
    }

    var cur = index[key]

    if (binders.values[key]) {
      var apis = cur.apis
      var bind_args = new Array(apis.length + 1)

      bind_args[0] = getHandler(self, cur)
      for (var i = 0; i < apis.length; i++) {
        bind_args[i + 1] = self._interfaces_used[apis[i]]
      }
      var cancel = cur.fn.apply(null, bind_args)
      if (cancel == null) {
        console.error(self.__code_path)
        throw new Error('effect should provide fn to cancel subscription ' + key)
      }
      binders.removers[key] = cancel

    } else {
      binders.removers[key].call()
      binders.removers[key] = null
    }
  }

  return binders
}

export default makeBindChanges
