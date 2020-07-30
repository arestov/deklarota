define(function(require) {
'use strict';

var spv = require('spv');
var utils_simple = require('../utils/simple');
var wipeObj = utils_simple.wipeObj
var requesting = require('./requesting');
var onInstanceInitDie = require('../internal_events/die/onInstanceInit')

var EventSubscribingOpts = function(ev_name, cb, once, context, immediately, wrapper) {
  this.ev_name = ev_name;
  this.cb = cb;
  this.once = once;
  this.context = context;
  this.immediately = immediately;
  this.wrapper = wrapper || null;
  Object.seal(this)
};

var iterateSubsCache = function(func) {
  return function(bhv, listener_name, obj) {
    if (!bhv.subscribes_cache) {
      return;
    }
    var cache = bhv.subscribes_cache[listener_name]
    if (!cache){
      return
    }

    bhv.subscribes_cache[listener_name] = func(cache, obj, listener_name);

    return bhv.subscribes_cache;
  };
};


var addToSubscribesCache = iterateSubsCache(function(matched, obj) {
  var result = matched;
  result.push(obj);
  return result;
});

var removeFromSubscribesCache = iterateSubsCache(function(matched, obj) {
  var pos = matched.indexOf(obj);
  if (pos != -1) {
    return spv.removeItem(matched, pos);
  }
});

var resetSubscribesCache = iterateSubsCache(function() {
  //fixme - bug for "state_change-workarea_width.song_file_progress" ( "state_change-workarea_width" stays valid, but must be invalid)
  return null;
});

var fireFire = function(context, sputnik, matched_reg_fire, soft_reg, callbacks_wrapper, ev_name, cb, one_reg_arg) {
  var mo_context = context || sputnik;
  if (soft_reg === false){
    cb.call(mo_context, one_reg_arg);
    return
  }

  var flow_step = sputnik._getCallsFlow().pushToFlow(
    cb, mo_context, null, one_reg_arg, callbacks_wrapper, sputnik, sputnik.current_motivator
  );

  if (!matched_reg_fire.handleFlowStep) {
    return
  }
  matched_reg_fire.handleFlowStep.call(sputnik, flow_step, matched_reg_fire.getFSNamespace(ev_name));

}

var FastEventor = function(context) {
  this.sputnik = context;
  this.subscribes = null;
  this.subscribes_cache = null;
  this.reg_fires = null;
  if (context.reg_fires){
    this.reg_fires = context.reg_fires;
  }
  this.requests = null;
  this._requestsSortFunc = null;
  this.mapped_reqs = null
  this.nesting_requests = null;
  onInstanceInitDie(this)
  Object.seal(this)
};
FastEventor.prototype = spv.coe(function(add) {

add({
  _pushCallbackToStack: function(ev_name, opts) {
    if (!this.subscribes) {
      this.subscribes = {};
    }

    if (!this.subscribes[ev_name]){
      this.subscribes[ev_name] = [];
    }
    this.subscribes[ev_name].push(opts);
    // resetSubscribesCache(this, opts.ev_name);
    addToSubscribesCache(this, opts.ev_name, opts);
  },
  getPossibleRegfires: function(ev_name) {
    if (!this.reg_fires){
      return;
    }
    if (this.reg_fires.cache && this.reg_fires.cache[ev_name]){
      return this.reg_fires.cache[ev_name];
    }

    var funcs = [];
    var i = 0;
    if (this.reg_fires.by_namespace){
      if (this.reg_fires.by_namespace[ev_name]){
        funcs.push(this.reg_fires.by_namespace[ev_name]);
      }
    }
    if (this.reg_fires.by_test){
      for (i = 0; i < this.reg_fires.by_test.length; i++) {
        if (this.reg_fires.by_test[i].test.call(this.sputnik, ev_name)){
          funcs.push(this.reg_fires.by_test[i]);
        }
      }
    }

    if (!this.reg_fires.cache){
      this.reg_fires.cache = {};
    }
    this.reg_fires.cache[ev_name] = funcs;
    return funcs;
  },

  hndUsualEvCallbacksWrapper: function(motivator, fn, context, args, arg) {
    if (motivator.p_space) {
      this.zdsv.removeFlowStep(motivator.p_space, motivator.p_index_key, motivator);
    }

    var old_m = context.current_motivator
    context.current_motivator = motivator
    if (args){
      fn.apply(context, args);
    } else {
      fn.call(context, arg);
    }

    context.current_motivator = old_m
  },
  _addEventHandler: function(ev_name_raw, cb, context, immediately, exlusive, skip_reg, soft_reg, once, easy_bind_control){
    //common opts allowed

    var ev_name = ev_name_raw;

    if (exlusive){
      this.off(ev_name);
    }

    var one_reg_arg = null;

    var reg_fires = this.getPossibleRegfires(ev_name);
    var matched_reg_fire = (reg_fires && reg_fires.length && reg_fires[0]) || null

    var callbacks_wrapper =
      (matched_reg_fire && matched_reg_fire.getWrapper && matched_reg_fire.getWrapper.call(this.sputnik)) ||
      this.hndUsualEvCallbacksWrapper

    var one_reg_arg = matched_reg_fire && matched_reg_fire.fn.call(this.sputnik, ev_name);
    var fired = one_reg_arg != null;
    if (fired && !skip_reg) {
      fireFire(context, this.sputnik, matched_reg_fire, soft_reg, callbacks_wrapper, ev_name, cb, one_reg_arg)
    }

    var subscr_opts =
      matched_reg_fire
        ? matched_reg_fire.createEventOpts(ev_name, cb, context)
        : new EventSubscribingOpts(ev_name, cb, once, context, immediately, callbacks_wrapper);

    if (!(once && fired)){
      this._pushCallbackToStack(ev_name, subscr_opts);
    }
    if (easy_bind_control){
      return subscr_opts;
    } else {
      return this.sputnik;
    }
  },
  once: function(ev_name, cb, opts, context){
    return this._addEventHandler(
      ev_name,
      cb,
      opts && opts.context || context,
      opts && opts.immediately,
      opts && opts.exlusive,
      opts && opts.skip_reg,
      opts && opts.soft_reg,
      true,
      opts && opts.easy_bind_control);
  },
  on: function(ev_name, cb, opts, context){
    return this._addEventHandler(
      ev_name,
      cb,
      opts && opts.context || context,
      opts && opts.immediately,
      opts && opts.exlusive,
      opts && opts.skip_reg,
      opts && opts.soft_reg,
      false,
      opts && opts.easy_bind_control);
  },
  off: function(event_name, cb, obj, context){
    var ev_name = event_name;

    var items = this.subscribes && this.subscribes[ev_name];

    if (items){
      if (obj) {
        var pos = items.indexOf(obj);
        if (pos != -1) {
          this.subscribes[ev_name] = spv.removeItem(items, pos);
          removeFromSubscribesCache(this, obj.ev_name, obj);
          // resetSubscribesCache(this, obj.ev_name);
        }
      } else {
        var clean = [];
        if (cb){
          for (var i = 0; i < items.length; i++) {
            var cur = items[i];
            if (cur.cb == cb && cur.ev_name == ev_name){
              if (!context || cur.context == context){
                continue;
              }
            }
            clean.push(items[i]);
          }
        } else {
          for (var i = 0; i < items.length; i++) {
            var cur = items[i];
            if (cur.ev_name == ev_name){
              if (!context || cur.context == context){
                continue;
              }
            }
            clean.push(items[i]);
          }
        }

        // losing `order by subscriging time` here
        // clean.push.apply(clean, queried.not_matched);

        if (clean.length != this.subscribes[ev_name].length){
          this.subscribes[ev_name] = clean;
          resetSubscribesCache(this, ev_name);
        }
      }

    }

    return this.sputnik;
  },
  getMatchedCallbacks: (function() {

    var _empty_callbacks_package = [];

    var find = function(ev_name, cb_cs) {
      var matched = [];
      for (var i = 0; i < cb_cs.length; i++) {
        if (cb_cs[i].ev_name == ev_name){
          matched.push(cb_cs[i]);
        }
      }
      return matched;
    };

    var setCache = function(self, ev_name, value) {
      if (!self.subscribes_cache) {
        self.subscribes_cache = {};
      }
      self.subscribes_cache[ev_name] = value;
      return value;
    };

    return function(ev_name_raw){
      var ev_name = ev_name_raw;

      var cb_cs = this.subscribes && this.subscribes[ev_name];

      if (!cb_cs){
        return _empty_callbacks_package;
      }

      var cached_r = this.subscribes_cache && this.subscribes_cache[ev_name];
      if (cached_r){
        return cached_r;
      }

      var value = find(ev_name, cb_cs);

      setCache(this, ev_name, value);
      return value;
    };
  })(),
  callEventCallback: function(cur, args, opts, arg) {
  //	var _this = this;
    if (cur.immediately && (!opts || !opts.force_async)){
      if (!args){
        cur.cb.call(cur.context || this.sputnik, arg);
        return
      }

      cur.cb.apply(cur.context || this.sputnik, args);

      return
    }

    var callback_context = cur.context || this.sputnik;

    return this.callCallback(callback_context, cur.cb, cur.wrapper, args, arg, (opts && opts.emergency))
    /*
    setTimeout(function() {
      cur.cb.apply(_this, args);
    },1);*/
  },
  callCallback: function(callback_context, cb, wrapper, args, arg, emergency) {
    var wrapper_context = this.sputnik;

    var calls_flow = (emergency) ? this.sputnik._calls_flow : this.sputnik._getCallsFlow();
    return calls_flow.pushToFlow(cb, callback_context, args, arg, wrapper, wrapper_context, this.sputnik.current_motivator);

  },
  cleanOnceEvents: function(event_name) {
    // this.off(ev_name, false, cur);

    var ev_name = event_name;

    var items = this.subscribes && this.subscribes[ev_name];
    if (items) {
      var clean = [];

      for (var i = 0; i < items.length; i++) {
        var cur = items[i];
        if (!cur.cb){
          continue;
        }
        clean.push(items[i]);
      }

      if (clean.length != this.subscribes[ev_name].length){
        this.subscribes[ev_name] = clean;
        resetSubscribesCache(this, ev_name);
      }
    }

  },
  triggerCallbacks: function(cb_cs, args, opts, ev_name, arg, flow_steps_array){
    var need_cleanup = false;
    for (var i = 0; i < cb_cs.length; i++) {
      var cur = cb_cs[i];
      if (!cur.cb) {
        continue;
      }
      var flow_step = this.callEventCallback(cur, args, opts, arg);
      if (flow_step && flow_steps_array) {
        flow_steps_array.push(flow_step);
      }
      if (cur.once){
        need_cleanup = true;
        cur.cb = null;
      }
    }

    if (need_cleanup) {
      this.cleanOnceEvents(ev_name);
    }
  },
  trigger: function(ev_name){
    var need_cleanup = false;
    var cb_cs = this.getMatchedCallbacks(ev_name);
    if (cb_cs){
      var i = 0;
      var args = new Array(arguments.length - 1);
      for (i = 1; i < arguments.length; i++) {
        args[ i - 1 ]= arguments[i];
      }

      for (i = 0; i < cb_cs.length; i++) {
        var cur = cb_cs[i];
        if (!cur.cb) {
          continue;
        }
        this.callEventCallback(cur, args, (args && args[ args.length -1 ]));
        if (cur.once){
          need_cleanup = true;
          cur.cb = null;
        }
      }
    }
    if (need_cleanup) {
      this.cleanOnceEvents(ev_name);
    }
    return this;
  }
});

var ReqExt = function() {
  this.xhr = null;
  this.deps = null;

};

function addDependence(req, md) {
  if (!req.pv_ext) {
    req.pv_ext = new ReqExt();
  }
  if (!req.pv_ext.deps) {
    req.pv_ext.deps = {};
  }

  var store = req.pv_ext.deps;
  var key = md._provoda_id;
  store[key] = true;

}

function softAbort(req, md) {
  if (!req.pv_ext || !req.pv_ext.deps) {
    return null;
  }

  var store = req.pv_ext.deps;
  var key = md._provoda_id;
  store[key] = false;

  if (!spv.countKeys(store, true)) {
    req.abort(md);
    // req.pv_ext.xhr.abort();
  }
}

add({
  default_requests_space: 'nav',
  getRequests: function(space) {
    space = space || this.default_requests_space;
    return this.requests && this.requests[space];
  },
  getQueued: function(space) {
    //must return new array;
    var requests = this.getRequests(space);
    return requests && spv.filter(requests, 'queued');
  },
  addRequest: function(rq, opts){
    this.addRequests([rq], opts);
    return this.sputnik;
  },
  addRequests: function(array, opts) {
    //opts = opts || {};
    //space, depend
    var _highway = this.sputnik._highway;

    var space = (opts && opts.space) || this.default_requests_space;
    var i = 0, req = null;

    if (opts && opts.order){
      for (i = 0; i < array.length; i++) {
        req = array[i];
        spv.setTargetField(req, this.sputnik.getReqsOrderField(), opts.order);
        req.order = opts.order;
      }
    }
    if (!this.requests) {
      this.requests = {};
    }

    if (!this.requests[space]){
      this.requests[space] = [];
    }

    var target_arr = this.requests[space];

    var bindRemove = function(_this, req) {
      req.then(anyway, anyway);

      function anyway() {
        if (_this.requests && _this.requests[space]){
          _this.requests[space] = spv.findAndRemoveItem(_this.requests[space], req);
        }

        var _highway = _this.sputnik._highway;
        if (_highway.requests) {
          _highway.requests = spv.findAndRemoveItem(_highway.requests, req);
        }

      }
    };
    var added = [];
    for (i = 0; i < array.length; i++) {
      req = array[i];

      if (_highway.requests && _highway.requests.indexOf(req) == -1) {
        _highway.requests.push(req);
      }

      /*if (req.queued){
        spv.setTargetField(req.queued, 'mdata.' + this._provoda_id, this);
      }*/
      if (target_arr.indexOf(req) != -1){
        continue;
      }
      if (opts && opts.depend){
        if (req){
          addDependence(req, this.sputnik);
        }
      }
      target_arr.push(req);
      bindRemove(this, req);
      added.push(req);
    }
    if (added.length){
      if (!opts || !opts.skip_sort){
        this.sortRequests(space);
      }
    }


  },
  _getRequestsSortFunc: function() {
    // used to sort localy, in model
    if (!this._requestsSortFunc) {
      var field_name = this.sputnik.getReqsOrderField();
      // if it has view/model mark that it should be first in view/model
      // that sort by mark value
      this._requestsSortFunc = spv.getSortFunc([
        function(el){
          if (typeof spv.getTargetField(el, field_name) == 'number'){
            return false;
          } else {
            return true;
          }
        },
        field_name
      ]);

    }
    return this._requestsSortFunc;
  },

  sortRequests: function(space) {
    var requests = this.requests && this.requests[space || this.default_requests_space];
    if (!this.requests || !this.requests.length) {
      return;
    }
    return requests.sort(this._getRequestsSortFunc());
  },
  getAllRequests: function() {
    var all_requests;
    if (!this.requests) {
      return all_requests;
    }
    for (var space in this.requests){
      if (this.requests[space].length){
        if (!all_requests) {
          all_requests = [];
        }
        all_requests.push.apply(all_requests, this.requests[space]);
      }
    }
    return all_requests;
  },
  stopRequests: function(){

    var all_requests = this.getAllRequests();

    while (all_requests && all_requests.length) {
      var rq = all_requests.pop();
      if (rq) {
        if (softAbort(rq, this.sputnik) === null) {
          rq.abort(this.sputnik);
        }
      }
    }
    wipeObj(this.requests);
    return this;
  },
  getModelImmediateRequests: function(space) {
    var reqs = this.getRequests(space);
    if (!reqs) {
      return [];
    }
    var queued = reqs.slice();
    if (queued){
      queued.reverse();
    }

    return queued;
  },
  setPrio: function(space) {
    var groups = [];
    var immediate = this.getModelImmediateRequests(space);
    if (immediate){
      groups.push(immediate);
    }
    var relative = this.sputnik.getRelativeRequestsGroups(space);
    if (relative && relative.length){
      groups.push.apply(groups, relative);
    }
    var setPrio = function(el) {
      if (el.queued) {
        el.queued.setPrio();
        return;
      }
      if (el.setPrio) {
        el.setPrio();
      }

    };
    groups.reverse();
    for (var i = 0; i < groups.length; i++) {
      groups[i].forEach(setPrio);
    }
    return this.sputnik;
  }
});

add(requesting);

});


return FastEventor;
});
