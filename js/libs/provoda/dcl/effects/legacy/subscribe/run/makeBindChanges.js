
import _updateAttr from '../../../../../_internal/_updateAttr'
import getDclInputApis from '../../utils/getDclInputApis'
import executeFn from '../executeFn'
import _getSubscribeRemover from './_getSubscribeRemover'
import _setSubscribeRemover from './_setSubscribeRemover'

// state_name в данном контексте просто key (за исключенимем момента когда нужно вызвать getStateUpdater)

const getCacheStore = (em) => {
  if (!em._highway._subscribe_effect_handlers) {
    em._highway._subscribe_effect_handlers = {}
  }

  const store = em._highway._subscribe_effect_handlers
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

const ensureHandler = function(fn, use_input) {
  return function(em, dcl, exactPart) {
    const value = getCacheValue(em, dcl)
    if (value) {return value}

    if (use_input === false) {
      const result = function(value) {
        fn(em, exactPart, value)
      }

      setCacheValue(em, dcl, result)
      return result
    }

    if (dcl.apis_as_input === false) {
      const result = em.inputFn(function(value) {
        fn(this, exactPart, value)
      })

      setCacheValue(em, dcl, result)
      return result
    }

    const result = function(value) {
      const apis_list = getDclInputApis(em, dcl)

      em.inputFromInterface(apis_list, function() {
        fn(em, exactPart, value)
      })
    }

    setCacheValue(em, dcl, result)
    return result
  }
}

const getStateUpdater = ensureHandler(function(em, state_name, value) {
  _updateAttr(em, state_name, value)
})

const getPassDispatcher = ensureHandler(function(em, pass_name, data) {
  em.__act(em, pass_name, data)
})

const getTargetedResultSaver = ensureHandler(function(em, dcl, data) {
  em.___dkt_saveInputFxTargetedResult(dcl, data)
})

const getRemoteHandler = ensureHandler(function(em, dcl, data) {
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


const getHandler = function(self, dcl) {
  if (dcl.remote_action && dcl.pass_name) {
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


const makeBindChanges = function(self, prev_values, next_values) {
  if (prev_values == null && next_values == null) {
    return
  }

  const index = self.__fxs_subscribe_by_name
  // __fxs_subscribe_by_name
  for (const key in next_values) {
    const change = Boolean(prev_values[key]) != Boolean(next_values[key])
    if (!change) {
      continue
    }

    const cur = index[key]

    if (next_values[key]) {
      const apis = cur.apis

      const cancel = executeFn(self, cur, getHandler, apis)
      if (cancel == null) {
        console.error(self.__code_path)
        throw new Error('effect should provide fn to cancel subscription ' + key)
      }
      _setSubscribeRemover(self, key, cancel)

    } else {
      _getSubscribeRemover(self, key).call()
      _setSubscribeRemover(self, key, null)
    }
  }
}

export default makeBindChanges
