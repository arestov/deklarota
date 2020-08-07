define(function(require) {
'use strict';

var FlowStep = require('./FlowStep');

var Group = function(num) {
  this.num = 1 // just hint type for js engine
  this.num = num;
  this.complex_order = [num];
  this.inited_order = this.complex_order;
  Object.seal(this)
};

var compareComplexOrder = function (array_one, array_two) {
  var max_length = Math.max(array_one.length, array_two.length);

  for (var i = 0; i < max_length; i++) {
    var item_one_step = array_one[i];
    var item_two_step = array_two[i];

    if (typeof item_one_step == 'undefined' && typeof item_two_step == 'undefined'){
      return;
    }
    if (typeof item_one_step == 'undefined'){
      // __[1, 2] vs [1, 2, 3] => __[1, 2], [1, 2, 3]
      return -1;
    }
    if (typeof item_two_step == 'undefined'){
      // __[1, 2, 3] vs [1, 2] => [1, 2], __[1, 2, 3]
      return 1;
    }
    if (item_one_step > item_two_step){
      return 1;
    }
    if (item_one_step < item_two_step){
      return -1;
    }
  }
};

var compareInitOrder = function (array_one, array_two, end_one, end_two) {
  var max_length = Math.max(array_one.length, array_two.length);

  for (var i = 0; i < max_length; i++) {
    var item_one_step = array_one[i];
    var item_two_step = array_two[i];

    if (typeof item_one_step == 'undefined' && typeof item_two_step == 'undefined'){
      return 0;
    }
    if (typeof item_one_step == 'undefined'){
      // __[1, 2]*END, [1, 2, 3]*END => [1, 2, 3]*END, __[1, 2]*END
      if (end_one && end_two) {
        return 1;
      }

      // __[1, 2]*END vs [1, 2, 3] => [1, 2, 3], __[1, 2]*END
      if (end_one) {
        return 1;
      }

      // __[1, 2], [1, 2, 3]*END => __[1, 2], [1, 2, 3]*END
      if (end_two) {
        return -1;
      }

      // __[1, 2] vs [1, 2, 3] => __[1, 2], [1, 2, 3]
      return -1;
    }
    if (typeof item_two_step == 'undefined'){
      // __[1, 2, 3]*END, [1, 2]*END => __[1, 2, 3]*END, [1, 2]*END
      if (end_one && end_two) {
        return -1;
      }

      // __[1, 2, 3]*END, [1, 2] => [1, 2], __[1, 2, 3]*END
      if (end_one) {
        return 1;
      }

      // __[1, 2, 3], [1, 2]*END => __[1, 2, 3], [1, 2]*END
      if (end_two) {
        return -1;
      }

      //__[1, 2, 3], [1, 2] vs  => [1, 2], __[1, 2, 3]
      return 1;
    }
    if (item_one_step > item_two_step){
      return 1;
    }
    if (item_one_step < item_two_step){
      return -1;
    }
  }
};

var sortFlows = function(item_one, item_two) {
  var none_one = !item_one || item_one.aborted;
  var none_two = !item_two || item_two.aborted;

  if (none_one && none_two) {
    return 0;
  } else if (none_one) {
    return -1;
  } else if (none_two) {
    return 1;
  }

  if (item_one.finup && item_two.finup) {
    return 0
  } else if (item_one.finup){
    return 1;
  } else if (item_two.finup) {
    return -1;
  }

  if (item_one.init_end || item_two.init_end) {
    return compareInitOrder(item_one.inited_order, item_two.inited_order, item_one.init_end, item_two.init_end);
  }




  /*if (item_one.custom_order && item_two.custom_order) {

  } else if (item_one.custom_order) {

  } else if (item_two.custom_order) {

  }*/

  return compareComplexOrder(item_one.complex_order, item_two.complex_order);
};


var getBoxedSetImmFunc = function(win) {
  var prom = win.Promise.resolve()
  return function(fn) {
    prom.then(fn)
  }
};

var getBoxedRAFFunc = function(win) {
  var raf;

  if ( win.requestAnimationFrame ){
    raf = win.requestAnimationFrame;
  } else {
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !raf; ++x) {
      raf = win[vendors[x]+'RequestAnimationFrame'];
    }
  }
  return raf && function(fn) {
    return raf.call(win, fn);
  };
};

var MIN = 60 * 1000

var CallbacksFlow = function(options) {
  // glo is global/window
  var glo = options.glo
  var rendering_flow = options.rendering_flow
  var iteration_time = options.iteration_time

  this.flow = [];
  this.flow_start = null;
  this.flow_end = null;
  this.busy = false;
  this.iteration_time = iteration_time || 250;
  this.iteration_delayed_check_time = 0;
  this.flow_steps_counter = 1;
  this.bad_stops_strike_counter = 0

  // this.flow_steps_collating_invalidated = null;
  var _this = this;
  this.hndIterateCallbacksFlow = function() {
    _this.iterateCallbacksFlow();
  };
  var raf = rendering_flow && getBoxedRAFFunc(glo);
  if ( raf ) {
    this.pushIteration = function(fn) {
      return raf(fn);
    };
  } else {
    var setImmediate = getBoxedSetImmFunc(glo);
    this.pushIteration = function(fn) {
      return setImmediate(fn);
    };
  }

  this.reportLongTask = options.reportLongTask || null
  this.reportHugeQueue = options.reportHugeQueue || null

};

CallbacksFlow.prototype = {
  input: function(fn) {
    this.pushToFlow(fn);
  },
  startGroup: function() {
    var step = new Group(++this.flow_steps_counter);
    this.callbacks_busy = true
    this.current_step = step
    return step
  },
  completeGroup: function(step) {
    if (this.current_step != step) {
      throw new Error('wrong step')
    }
    this.callbacks_busy = false
    this.current_step = null
  },
  iterateCallbacksFlow: function() {
    var started_at = Date.now()
    var start = started_at + this.iteration_time;
    var last_call_at = started_at
    this.iteration_delayed_check_time = 0;
    this.callbacks_busy = true;

    var stopped;
    for (var cur = this.flow_start; cur;) {
      this.flow_start = cur;
      if (!this.flow_start) {
        this.flow_end = null;
      }

      if (last_call_at > start){
        stopped = cur;
        this.pushIteration(this.hndIterateCallbacksFlow);
        break;
      }

      this.flow_start = cur.next;
      if (!this.flow_start) {
        this.flow_end = null;
      }

      if (!cur.aborted) {
        this.current_step = cur;
        cur.call();
        this.current_step = null;
      }

      var completed_at = Date.now()

      if (this.reportLongTask != null) {
        this.reportLongTaskRaw(completed_at - last_call_at, cur)
      }

      last_call_at = completed_at


      var toClean = cur

      if (this.flow_start == cur) {
        cur = cur.next;
      } else {
        cur = this.flow_start;
      }

      // clean
      toClean.next = null
    }
    this.flow_start = stopped;
    if (!stopped) {
      this.bad_stops_strike_counter = 0
      this.flow_end = null;
    } else {
      this.bad_stops_strike_counter++

      if (this.bad_stops_strike_counter >= 5) {
        this.reportHugeQueueRaw(last_call_at - started_at, stopped)
        this.bad_stops_strike_counter = 0
      }
    }

    if (!this.flow_start) {
      this.callbacks_busy = false;
    }

  },
  checkCallbacksFlow: function() {
    if (this.iteration_delayed_check_time || this.callbacks_busy) {
      return
    }

    this.pushIteration(this.hndIterateCallbacksFlow);
    this.iteration_delayed_check_time = Math.round(Date.now()) + MIN;
  },
  pushToFlow: function(fn, context, args, cbf_arg, cb_wrapper, real_context, motivator, finup, initiator, init_end) {
    var flow_step_num = ++this.flow_steps_counter

    var complex_order = ( motivator && motivator.complex_order.slice() ) || [];
    complex_order.push(flow_step_num);

    var inited_order = initedOrder(initiator, motivator);
    inited_order.push(flow_step_num);

    var flow_step = new FlowStep(flow_step_num, complex_order, inited_order, fn, context, args, cbf_arg, cb_wrapper, real_context, finup, init_end);
    order(this, flow_step);
    this.checkCallbacksFlow();
    return flow_step;

  },
  scheduleTransactionEnd: function functionName(starter_id, context, args, fn, cb_wrapper) {
    var flow_step_num = ++this.flow_steps_counter
    var complex_order = [starter_id, Infinity, flow_step_num]
    var inited_order = complex_order

    var flow_step = new FlowStep(flow_step_num, complex_order, inited_order, fn, context, args, null, cb_wrapper);
    order(this, flow_step);
    this.checkCallbacksFlow();
  },
  reportLongTaskRaw: function(taskTime, task) {
    if (taskTime < 500) {
      return
    }
    var reportLongTask = this.reportLongTask
    reportLongTask(task, taskTime)
  },

  reportHugeQueueRaw: function(duration, task) {
    if (this.reportHugeQueue == null) {
      return
    }

    var reportHugeQueue = this.reportHugeQueue
    reportHugeQueue(task, duration)
  }
};

function order(self, flow_step) {
  var last_item = self.flow_end;

  var result = last_item && sortFlows(flow_step, last_item);

  if (result >= 0) {
    //очевидно, что новый элемент должен стать в конец
    return toEnd(self, flow_step);
  }

  var last_matched;
  for (var cur = self.flow_start; cur; cur = cur.next) {
    var match_result = sortFlows(cur, flow_step);
    if (match_result == -1) {
      last_matched = cur;
    } else {
      break;
    }
  }

  if (!cur) {
    throw new Error('something wrong');
  }

  if (!last_matched) {
    flow_step.next = self.flow_start;
    self.flow_start = flow_step;
  } else {
    flow_step.next = last_matched.next;
    last_matched.next = flow_step;
  }
}

function toEnd(self, flow_step) {
  if (self.flow_end) {
    self.flow_end.next = flow_step;
  }
  self.flow_end = flow_step;
  if (!self.flow_start) {
    self.flow_start = flow_step;
  }

  return flow_step;
}

function initedOrder(initiator, parent_motivator) {
  if (initiator) {
    return initiator.inited_order.slice();
  }
  if (parent_motivator) {
    return parent_motivator.inited_order.slice();
  }

  return [];
}

return CallbacksFlow;
});
