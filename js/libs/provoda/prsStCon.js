
var readDepValue = require('./utils/readDepValue')
var read = readDepValue.read

var bind = {
  root: function(bind) {
    return function(md, instructions, context) {
      var list = instructions.conndst_root
      if (!list) {
        return
      }
      for (var i = 0; i < list.length; i++) {
        var cur = list[i]
        var target = md.getStrucRoot()
        if (!target) {
          throw new Error()
        }

        bind(md, target, cur.state_name, cur.full_name, context)
      }
    }
  },
  parent: function(bind) {
    return function(md, instructions, context) {
      var list = instructions.conndst_parent
      if (!list) {
        return
      }
      for (var i = 0; i < list.length; i++) {
        var cur = list[i]
        var count = cur.ancestors
        var target = md
        while (count) {
          count--
          target = target.getStrucParent()
        }
        if (!target) {
          throw new Error()
        }

        bind(md, target, cur.state_name, cur.full_name, context)
      }

    }
  }
}

var subscribe = function(md, target, state_name, full_name) {
  md.wlch(target, state_name, full_name)
}

var unsubscribe = function(md, target, state_name, full_name) {
  md.unwlch(target, state_name, full_name)
}

export default {
  bind: bind,
  prefill: {
    self: function(md, states_list) {
      if (!md.connect_self) {
        return
      }
      states_list.push('<<<<', md)
    },
    parent: function(md, states_list) {
      var list = md.conndst_parent
      if (!list) {
        return
      }

      for (var i = 0; i < list.length; i++) {
        var cur = list[i]
        var value = read.parent(md, cur)

        states_list.push(cur.full_name, value)
      }
    },
    root: function(md, states_list) {
      var list = md.conndst_root
      if (!list) {
        return
      }
      for (var i = 0; i < list.length; i++) {
        var cur = list[i]
        var value = read.root(md, cur)
        states_list.push(cur.full_name, value)
      }
    }
  },
  connect: {
    nesting: function() {},
    parent: bind.parent(subscribe),
    root: bind.root(subscribe),
  },
  disconnect: {
    nesting: function() {},
    parent: bind.parent(unsubscribe),
    root: bind.root(unsubscribe),
  }
}
