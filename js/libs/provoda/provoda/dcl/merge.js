define(function() {
'use strict'

var softMerge = function(to, from, strict) {
  if (!from) {
    return to
  }

  for (var prop in from) {
    if (!from.hasOwnProperty(prop)) {
      return
    }

    if (strict !== false) {
      if (to.hasOwnProperty(prop)) {
        console.log('merge conflict', to, from)
        throw new Error('merge conflict')
      }
    }

    to[prop] = from[prop]
  }

  return to
}

function addNotEmptyProp(target, name, value) {
  if (!Object.keys(value).length) {
    return target
  }


  target[name] = value

  return target
}

return function() {
  var args = Array.prototype.slice.call(arguments)
  var result = {}

  var attrs = {}
  var rels = {}
  var actions = {}
  var routes = {}
  var effects = {}

  var effects_api = {}
  var effects_consume = {}
  var effects_produce = {}

  for (var i = 0; i < args.length; i++) {
    var cur = args[i]
    softMerge(result, cur)
    delete result.attrs
    delete result.rels
    delete result.actions
    delete result.routes
    delete result.effects

    softMerge(attrs, cur.attrs)
    softMerge(rels, cur.rels)
    softMerge(actions, cur.actions)
    softMerge(routes, cur.routes)

    var cur_effects = cur.effects || {}
    softMerge(effects_api, cur_effects.api)
    softMerge(effects_consume, cur_effects.consume)
    softMerge(effects_produce, cur_effects.produce)

  }


  addNotEmptyProp(effects, 'api', effects_api)
  addNotEmptyProp(effects, 'consume', effects_consume)
  addNotEmptyProp(effects, 'produce', effects_produce)


  addNotEmptyProp(result, 'attrs', attrs)
  addNotEmptyProp(result, 'rels', rels)
  addNotEmptyProp(result, 'actions', actions)
  addNotEmptyProp(result, 'routes', routes)
  addNotEmptyProp(result, 'effects', effects)

  return result
}
})
