import getRemovedNestingItems from './utils/h/getRemovedNestingItems'
import sameName from './sameName'
import sameObjectIfEmpty from './utils/sameObjectIfEmpty'
import { init as initStores, methods as storesMethods } from './MDProxy/stores'
const CH_GR_LE = 2

var MDProxy = function(_provoda_id, mutable_children_models, md, space) {
  this._provoda_id = _provoda_id
  this.key = _provoda_id
  this.views = null
  this.views_index = null
  this.vstates = null
  //this.children_models = children_models;
  this.md = md
  this.nestings = sameObjectIfEmpty(mutable_children_models)
  this.space = space || null
  initStores(this)

  Object.seal(this)
}

const mutateRels = (target) => {
  if (Object.isFrozen(target.nestings)) {
    target.nestings = {}
  }

  return target.nestings
}

Object.assign(MDProxy.prototype, storesMethods)

const toMpx = (context, md) => {
  const key = md._provoda_id
  const mpx = context.space.mpxes_index[key]
  return mpx
}

Object.assign(MDProxy.prototype, {
  getAttr: function(attr_name) {
    return this.md.states[attr_name]
  },
  getRel: function(rel_name) {
    if (!this.nestings == null) {
      return null
    }

    var list = this.nestings[rel_name]
    if (list == null) {
      return null
    }
    if (!Array.isArray(list)) {
      return toMpx(this, list)
    }

    let result = []
    for (var i = 0; i < list.length; i++) {
      const item = list[i]
      const mpx = toMpx(this, item)
      if (!mpx) {continue}

      result.push(mpx)
    }

    return result

  },
  dispatch: function(action_name, payload) {
    this.RPCLegacy('dispatch', action_name, payload)
  },

  __getAttr: function(name) {
    return this.md.states[name]
  },
  __getBhvId: function() {
    return this.md.constr_id
  },
  _assignPublicAttrs: function(target) {
    return this.md._assignPublicAttrs(target)
  },
  __getRels: function() {
    return this.nestings
  },
  RPCLegacy: function() {
    var args = Array.prototype.slice.call(arguments)
    var data = JSON.parse(JSON.stringify(args))

    if (this.space == null || this.space.sendRPCLegacy == null) {
      this.md.RPCLegacy.apply(this.md, data)
      return
    }

    this.space.sendRPCLegacy(this._provoda_id, args)
  },
  setStates: function() {},
  updateStates: function() {},
  updateNesting: function() {},
  updateManyStates: function(obj) {
    if (!this.vstates) {
      this.vstates = {}
    }
    var changes_list = []
    for (var name in obj) {
      this.vstates[sameName(name)] = obj[name]
      changes_list.push(name, obj[name])
    }
    this.sendStatesToViews(changes_list)
    return this
  },
  updateState: function(name, value, opts) {
    //fixme если вьюха ещё не создана у неё не будет этого состояния
    //эклюзивные состояния для вьюх не хранятся и не передаются при создании

    /*if (name.indexOf('-') != -1 && console.warn){
      console.warn('fix prop name: ' + name);
    }*/
    if (!this.vstates) {
      this.vstates = {}
    }
    this.vstates[sameName(name)] = value
    this.sendStatesToViews([name, value], opts)
    return this
  },
  state: function(state_name) {
    return this.vstates && this.vstates[state_name]
  },
  removeView: function(view) {
    if (!this.views) {
      return
    }
    var views = []
    for (var i = 0; i < this.views.length; i++) {
      if (views[i] !== view) {
        views.push(views[i])
      }
    }
    if (views.length != this.views.length) {
      this.views = views
    }
  },
  sendCollectionChange: function(collection_name, array) {
    var old_value = this.nestings[collection_name]

    mutateRels(this)
    this.nestings[collection_name] = array

    this.__notifyRelChangeWatchers(collection_name)

    if (!this.views) {
      return
    }
    var removed = getRemovedNestingItems(array, old_value)

    for (var i = 0; i < this.views.length; i++) {
      this.views[i].stackCollectionChange(collection_name, array, old_value, removed)
    }
  },

  stackReceivedStates: function(states_list) {
    // should be scheduled using context's mircotasks
    for (var i = 0; i < states_list.length; i += CH_GR_LE) {
      this.__notifyAttrChangeWatchers(states_list[i], states_list[i + 1])
    }

    if (!this.views) {
      return
    }
    for (var i = 0; i < this.views.length; i++) {
      this.views[i].stackReceivedChanges(states_list)
    }
  },
  sendStatesToViews: function(states_list, opts) {
    for (var i = 0; i < states_list.length; i += CH_GR_LE) {
      this.__notifyAttrChangeWatchers(states_list[i], states_list[i + 1])
    }

    if (!this.views) {
      return
    }
    for (var i = 0; i < this.views.length; i++) {
      this.views[i].receiveStatesChanges(states_list, opts)
    }
  },
  removeDeadViews: function(hard_deads_check, complex_id) {
    var i = 0
    if (hard_deads_check) {
      var target_view = complex_id && this.views_index && this.views_index[complex_id]
      var checklist = complex_id ? (target_view && [target_view]) : this.views
      if (checklist) {
        for (i = 0; i < checklist.length; i++) {
          if (checklist[i].isAlive) {
            checklist[i].isAlive()
          }
        }
      }

    }
    if (this.views) {
      var dead = [], alive = []
      for (i = 0; i < this.views.length; i++) {
        if (this.views[i].dead) {
          dead.push(this.views[i])
        } else {
          alive.push(this.views[i])
        }
      }

      if (alive.length != this.views.length) {
        this.views = alive
      }
      if (dead.length) {
        for (var a in this.views_index) {
          var cur = this.views_index[a]
          if (dead.indexOf(cur) != -1) {
            this.views_index[a] = null
          }
          // = spv.arrayExclude(this.views_index[a], dead);
        }
      }
    }


    return this
  },
  die: function() {
    this.killViews()
  },
  killViews: function() {
    //this.views[i] can be changed in proccess, so cache it!
    var views = this.views
    if (!views) {
      return
    }
    for (var i = 0; i < views.length; i++) {
      views[i].die({skip_md_call: true})
    }
    this.removeDeadViews()
    return this
  },
  collectViewsGarbadge: function() {
    if (!this.views) {
      return
    }
    for (var i = 0; i < this.views.length; i++) {
      this.views[i].checkDeadChildren()
    }
  },
  getViews: function(complex_id, hard_deads_check) {
    this.removeDeadViews(hard_deads_check)
    if (complex_id) {
      return [this.views_index && this.views_index[complex_id]]
    } else {
      return this.views || []
    }
  },
  getView: function(complex_id) {
    this.removeDeadViews(true, complex_id)
    if (!complex_id) {
      throw new Error('complex_id')
    }
    //complex_id = complex_id || 'main';
    return this.views_index && this.views_index[complex_id]// && this.views_index[complex_id][0];
  },
  addView: function(v, complex_id) {
    this.removeDeadViews(true, complex_id)
    if (!this.views) {
      this.views = []
    }
    this.views.push(v)
    if (!this.views_index) {
      this.views_index = {}
    }
    this.views_index[complex_id] = v
    //(= this.views_index[complex_id] || []).push(v);
    return this
  },
  dispose: function() {
    this.md = null
    this.nestings = null
    this.space = null
  }
})
export default MDProxy
