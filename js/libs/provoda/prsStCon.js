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
