

import spv from '../../spv'
import requesting from './requesting'
const removeItem = spv.removeItem

const EventSubscribingOpts = function(ev_name, cb, once, context, immediately, wrapper) {
  this.ev_name = ev_name
  this.cb = cb
  this.once = once
  this.context = context
  this.immediately = immediately
  this.wrapper = wrapper || null
  Object.freeze(this)
}

const iterateSubsCache = function(func) {
  return function(bhv, listener_name, obj) {
    if (!bhv.subscribes_cache) {
      return
    }
    const cache = bhv.subscribes_cache[listener_name]
    if (!cache) {
      return
    }

    bhv.subscribes_cache[listener_name] = func(cache, obj, listener_name)

    return bhv.subscribes_cache
  }
}


const addToSubscribesCache = iterateSubsCache(function(matched, obj) {
  const result = matched
  result.push(obj)
  return result
})

const removeFromSubscribesCache = iterateSubsCache(function(matched, obj) {
  const pos = matched.indexOf(obj)
  if (pos != -1) {
    return removeItem(matched, pos)
  }
})

const resetSubscribesCache = iterateSubsCache(function() {
  //fixme - bug for "state_change-workarea_width.song_file_progress" ( "state_change-workarea_width" stays valid, but must be invalid)
  return null
})

const fireFire = function(context, sputnik, _matched_reg_fire, soft_reg, callbacks_wrapper, _ev_name, cb, one_reg_arg) {
  const mo_context = context || sputnik
  if (soft_reg === false) {
    cb.call(mo_context, one_reg_arg)
    return
  }

  sputnik._getCallsFlow().pushToFlow(
    cb, mo_context, null, one_reg_arg, callbacks_wrapper, sputnik, sputnik._currentMotivator()
  )
}

const withoutIndex = (array, index, length) => {
  for (let i = index + 1; i < length; i++) {
    array[ i - 1 ] = array[ i ]
  }
}



const withoutCriteria = (isOk) => (array, arg1, arg2, arg3) => {
  let count = 0
  for (let i = array.length - 1; i >= 0; i--) {
    if (!isOk(array[i], arg1, arg2, arg3)) {
      continue
    }
    withoutIndex(array, i, array.length - count)
    count++

  }

  array.length = array.length - count

  return array
}

const withoutEvItem = withoutCriteria((cur, ev_name, cb, context) => {
  if (cb && cur.cb != cb) {
    return false
  }

  if (context && cur.context != context) {
    return false
  }

  return cur.ev_name == ev_name
})

const withoutOnce = withoutCriteria((cur) => {
  return Boolean(cur.cb)
})

const FastEventor = function(context) {
  this.sputnik = context
  this.subscribes = null
  this.subscribes_cache = null
  this.reg_fires = null
  if (context.reg_fires) {
    this.reg_fires = context.reg_fires
  }
  this._requestsSortFunc = null
  this.mapped_reqs = null
  this.nesting_requests = null
  Object.seal(this)
}
FastEventor.prototype = spv.coe(function(add) {

  add({
    _pushCallbackToStack: function(ev_name, opts) {
      if (!this.subscribes) {
        this.subscribes = {}
      }

      if (!this.subscribes[ev_name]) {
        this.subscribes[ev_name] = []
      }
      this.subscribes[ev_name].push(opts)
    // resetSubscribesCache(this, opts.ev_name);
      addToSubscribesCache(this, opts.ev_name, opts)
    },
    getPossibleRegfires: function(ev_name) {
      if (!this.reg_fires) {
        return
      }
      if (this.reg_fires.cache && this.reg_fires.cache[ev_name]) {
        return this.reg_fires.cache[ev_name]
      }

      const funcs = []
      let i = 0
      if (this.reg_fires.by_namespace) {
        if (this.reg_fires.by_namespace[ev_name]) {
          funcs.push(this.reg_fires.by_namespace[ev_name])
        }
      }
      if (this.reg_fires.by_test) {
        for (i = 0; i < this.reg_fires.by_test.length; i++) {
          if (this.reg_fires.by_test[i].test.call(this.sputnik, ev_name)) {
            funcs.push(this.reg_fires.by_test[i])
          }
        }
      }

      if (!this.reg_fires.cache) {
        this.reg_fires.cache = {}
      }
      this.reg_fires.cache[ev_name] = funcs
      return funcs
    },

    hndUsualEvCallbacksWrapper: function(motivator, fn, context, args, arg) {
      const old_m = context.current_motivator
      context.current_motivator = motivator
      if (args) {
        fn.apply(context, args)
      } else {
        fn.call(context, arg)
      }

      context.current_motivator = old_m
    },
    _addEventHandler: function(ev_name_raw, cb, context, immediately, exlusive, skip_reg, soft_reg, once, easy_bind_control) {
    //common opts allowed

      const ev_name = ev_name_raw

      if (exlusive) {
        this.off(ev_name)
      }

      const reg_fires = this.getPossibleRegfires(ev_name)
      const matched_reg_fire = (reg_fires && reg_fires.length && reg_fires[0]) || null

      const callbacks_wrapper =
      (matched_reg_fire && matched_reg_fire.getWrapper && matched_reg_fire.getWrapper.call(this.sputnik)) ||
      this.hndUsualEvCallbacksWrapper

      const one_reg_arg = matched_reg_fire && matched_reg_fire.fn.call(this.sputnik, ev_name)
      const fired = one_reg_arg != null
      if (fired && !skip_reg) {
        fireFire(context, this.sputnik, matched_reg_fire, soft_reg, callbacks_wrapper, ev_name, cb, one_reg_arg)
      }

      const subscr_opts =
      matched_reg_fire
        ? matched_reg_fire.createEventOpts(ev_name, cb, context)
        : new EventSubscribingOpts(ev_name, cb, once, context, immediately, callbacks_wrapper)

      if (!(once && fired)) {
        this._pushCallbackToStack(ev_name, subscr_opts)
      }
      if (easy_bind_control) {
        return subscr_opts
      } else {
        return this.sputnik
      }
    },
    once: function(ev_name, cb, opts, context) {
      return this._addEventHandler(
        ev_name,
        cb,
        opts && opts.context || context,
        opts && opts.immediately,
        opts && opts.exlusive,
        opts && opts.skip_reg,
        opts && opts.soft_reg,
        true,
        opts && opts.easy_bind_control)
    },
    on: function(ev_name, cb, opts, context) {
      return this._addEventHandler(
        ev_name,
        cb,
        opts && opts.context || context,
        opts && opts.immediately,
        opts && opts.exlusive,
        opts && opts.skip_reg,
        opts && opts.soft_reg,
        false,
        opts && opts.easy_bind_control)
    },
    off: function(event_name, cb, obj, context) {
      const ev_name = event_name

      const items = this.subscribes && this.subscribes[ev_name]

      if (items) {
        if (obj) {
          const pos = items.indexOf(obj)
          if (pos != -1) {
            this.subscribes[ev_name] = removeItem(items, pos)
            removeFromSubscribesCache(this, obj.ev_name, obj)
          // resetSubscribesCache(this, obj.ev_name);
          }
        } else {
          const original_length = items.length


          const clean = withoutEvItem(items, ev_name, cb, context)
        // losing `order by subscriging time` here
        // clean.push.apply(clean, queried.not_matched);

          if (clean.length != original_length) {
            this.subscribes[ev_name] = clean
            resetSubscribesCache(this, ev_name)
          }
        }

      }

      return this.sputnik
    },
    getMatchedCallbacks: (function() {

      const _empty_callbacks_package = []

      const find = function(ev_name, cb_cs) {
        const matched = []
        for (let i = 0; i < cb_cs.length; i++) {
          if (cb_cs[i].ev_name == ev_name) {
            matched.push(cb_cs[i])
          }
        }
        return matched
      }

      const setCache = function(self, ev_name, value) {
        if (!self.subscribes_cache) {
          self.subscribes_cache = {}
        }
        self.subscribes_cache[ev_name] = value
        return value
      }

      return function(ev_name_raw) {
        const ev_name = ev_name_raw

        const cb_cs = this.subscribes && this.subscribes[ev_name]

        if (!cb_cs) {
          return _empty_callbacks_package
        }

        const cached_r = this.subscribes_cache && this.subscribes_cache[ev_name]
        if (cached_r) {
          return cached_r
        }

        const value = find(ev_name, cb_cs)

        setCache(this, ev_name, value)
        return value
      }
    })(),
    callEventCallback: function(cur, args, opts, arg) {
  //	var _this = this;
      if (cur.immediately && (!opts || !opts.force_async)) {
        if (!args) {
          cur.cb.call(cur.context || this.sputnik, arg)
          return
        }

        cur.cb.apply(cur.context || this.sputnik, args)

        return
      }

      const callback_context = cur.context || this.sputnik

      return this.callCallback(callback_context, cur.cb, cur.wrapper, args, arg, (opts && opts.emergency))
    /*
    setTimeout(function() {
      cur.cb.apply(_this, args);
    },1);*/
    },
    callCallback: function(callback_context, cb, wrapper, args, arg, emergency) {
      const wrapper_context = this.sputnik

      const calls_flow = (emergency) ? this.sputnik._calls_flow : this.sputnik._getCallsFlow()
      return calls_flow.pushToFlow(cb, callback_context, args, arg, wrapper, wrapper_context, this.sputnik._currentMotivator())

    },
    cleanOnceEvents: function(event_name) {
    // this.off(ev_name, false, cur);

      const ev_name = event_name

      const items = this.subscribes && this.subscribes[ev_name]
      if (items) {
        const original_length = items.length
        const clean = withoutOnce(items, null, null, null)

        if (clean.length != original_length) {
          this.subscribes[ev_name] = clean
          resetSubscribesCache(this, ev_name)
        }
      }

    },
    triggerCallbacks: function(cb_cs, args, opts, ev_name, arg) {
      let need_cleanup = false
      for (let i = 0; i < cb_cs.length; i++) {
        const cur = cb_cs[i]
        if (!cur.cb) {
          continue
        }
        this.callEventCallback(cur, args, opts, arg)

        if (cur.once) {
          need_cleanup = true
          cur.cb = null
        }
      }

      if (need_cleanup) {
        this.cleanOnceEvents(ev_name)
      }
    },
    trigger: function(ev_name) {
      let need_cleanup = false
      const cb_cs = this.getMatchedCallbacks(ev_name)
      if (cb_cs) {
        let i = 0
        const args = new Array(arguments.length - 1)
        for (i = 1; i < arguments.length; i++) {
          args[ i - 1 ] = arguments[i]
        }

        for (i = 0; i < cb_cs.length; i++) {
          const cur = cb_cs[i]
          if (!cur.cb) {
            continue
          }
          this.callEventCallback(cur, args, (args && args[ args.length - 1 ]))
          if (cur.once) {
            need_cleanup = true
            cur.cb = null
          }
        }
      }
      if (need_cleanup) {
        this.cleanOnceEvents(ev_name)
      }
      return this
    }
  })

  add(requesting)

})


export default FastEventor
