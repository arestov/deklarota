

const softMerge = function(to, from, strict) {
  if (!from) {
    return to
  }

  for (const prop in from) {
    if (!from.hasOwnProperty(prop)) {
      return
    }

    if (strict !== false) {
      if (to.hasOwnProperty(prop) && to[prop] !== from[prop]) {
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

function copyEffects(target_api, target_consume, target_produce, source) {
  if (!source) {
    return
  }

  softMerge(target_api, source.api)
  softMerge(target_consume, source.in)
  softMerge(target_produce, source.out)
}

export default function() {
  const args = Array.prototype.slice.call(arguments)
  const result = {}

  const attrs = {}
  const rels = {}
  const actions = {}
  const routes = {}
  const effects = {}

  const effects_api = {}
  const effects_consume = {}
  const effects_produce = {}

  for (let i = 0; i < args.length; i++) {
    const cur = args[i]
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

    copyEffects(effects_api, effects_consume, effects_produce, cur.effects)
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
};
