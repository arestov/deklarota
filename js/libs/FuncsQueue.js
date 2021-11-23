
import FuncsStack from './FuncsStack'
const QueueFunc = function(queue, atom) {
  this.q = queue
  this.atom = atom
  this.aborted = null
}
QueueFunc.prototype = {
  constructor: QueueFunc,
  abort: function() {
    if (this.aborted) {
      return
    }
    this.aborted = true
    if (!this.atom.complete) {
      this.atom.abort()
    }

    this.q = null
    this.atom = null
    this.pr = null
  },
  setPrio: function() {
    if (this.q) {
      this.pr = this.q.getTopPrio() + 1
    }

  },
  removePr: function() {
    this.pr = null
  }
}


const FuncsQueue = function(opts) {
  const _this = this

  const time_opts = opts.time
  const small_delay = time_opts[0]
  const big_delay = time_opts[1]
  const big_delay_interval = time_opts[2]

  if (opts.resortQueue) {
    this.resortQueue = opts.resortQueue
  }
  if (opts.reverse_default_prio) {
    this.reverse_default_prio = true
  }

  const selectNext = function(prev) {
    _this.goAhead(prev)
  }
  const initAtom = function(atom) {
    atom.qf = new QueueFunc(_this, atom)
  }

  this.fstack = new FuncsStack(selectNext, initAtom)


  if (small_delay) {
    this.small_delay = small_delay
  }
  if (big_delay) {
    this.big_delay = big_delay
  }
  if (big_delay_interval) {
    this.big_delay_interval = big_delay_interval
  }
  if (!big_delay || !big_delay_interval) {
    this.nobigdelay = true
  }
  this.using_stat = []
  if (opts.init) {
    opts.init.call(this, this)
  }
}


FuncsQueue.prototype = {
  constructor: FuncsQueue,
  removePrioMarks: function() {
    const queue = this.fstack.getArr()
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].aborted) {
        continue
      }
      queue[i].qf.removePr()
    }
    this.valid_sort = false
  },
  getTopPrio: function() {
    const nums = []
    const queue = this.fstack.getArr()
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].aborted) {
        continue
      }
      const cur = queue[i].qf.pr
      if (typeof cur == 'number') {
        nums.push(cur)
      }
      //fixme - use cache
    }
    if (nums.length) {
      return Math.max.apply(Math, nums)
    } else {
      return 0
    }
  },
  goAhead: function(prev) {
    const _this = this

    const time = _this.getInterval(prev)
    if (time) {
      setTimeout(function() {
        _this.selectNext(prev)
      }, time)
    } else{
      _this.selectNext(prev)
    }
  },
  getInterval: function() {
    let
      time
    const last_num = this.using_stat.length - 1
    const bigdelay_turn = (!this.nobigdelay && last_num > 1 && (last_num % this.big_delay_interval === 0))

    if (bigdelay_turn) {
      const real_bdinterval = Date.now() - this.using_stat[last_num - (this.big_delay_interval + 1)]
      const _unit = (this.small_delay * this.big_delay_interval + this.big_delay)
      if (real_bdinterval && real_bdinterval > _unit) {
        time = Math.max(0, this.big_delay - (real_bdinterval - _unit))
      } else{
        time = this.big_delay
      }
    } else{
      const last_usage = this.using_stat[last_num] || 0
      if (!last_usage) {
        time = 0
      } else{
        const time_difference = Date.now() - last_usage
        const interval_diff = this.small_delay - time_difference
        if (interval_diff > 0) {
          time = interval_diff
        } else{
          time = 0
        }

      }

    }

    return time
  },
  add: function(func, not_init) {
    const
      _this = this
    const my_queue = this.fstack.getArr()

    not_init = not_init || my_queue.length !== 0

    this.fstack.next(function() {
      this.complete = true
      const atom = this
      func()
      _this.using_stat.push(Date.now())

      atom.done(my_queue)
    })

    const _ob = my_queue[my_queue.length - 1].qf

    if (!not_init) {
      this.init()
    }
    this.valid_sort = false
    return _ob
  },
  init: function(force) {
    if (!force && this.fstack.getArr().inited) {
      return this.fstack.getArr()
    } else {
      this.fstack.getArr().inited = true
      this.goAhead()
    }
    return this
  },
  selectNext: function() {
    if (!this.valid_sort) {
      if (this.resortQueue) {
        this.resortQueue.call(null, this)
      }
      this.valid_sort = true
    }

    let
      i
    let atom
    const q = this.fstack.getArr()
    const clean_quene = []
    let prior_num = 0
    let prior_el = null
    let preferred_by_default = null

    for (i = 0; i < q.length; i++) {
      atom = q[i]
      if (!atom.complete && !atom.aborted) {
        clean_quene.push(atom)
      }
    }

    for (i = 0; i < clean_quene.length; i++) {
      atom = clean_quene[i]
      if (atom.qf.pr && (atom.qf.pr > prior_num)) {
        prior_num = atom.qf.pr
        prior_el = atom
      }
    }

    if (!prior_el) {
      if (this.reverse_default_prio) {
        preferred_by_default = clean_quene[ clean_quene.length - 1 ]
      } else {
        preferred_by_default = clean_quene[0]
      }
    }

    const vip = prior_el || preferred_by_default

    if (vip) {
      vip.func()
      return vip.func
    } else{
      this.reset()
      return false
    }

  },
  reset: function() {
    this.fstack.reset()
    return this
  }
}
export default FuncsQueue
