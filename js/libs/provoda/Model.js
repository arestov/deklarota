

import spv from '../spv'
import StatesLabour from './StatesLabour'
import hp from './helpers'
import MDProxy from './MDProxy'
import initDeclaredNestings from './initDeclaredNestings'
import prsStCon from './prsStCon'
import updateProxy from './updateProxy'
import StatesEmitter from './StatesEmitter'
import _requestsDeps from './Model/_requestsDeps'
import onPropsExtend from './Model/onExtend'
import initModel from './Model/init'
import gentlyUpdateNesting from './Model/gentlyUpdateNesting'
import postInitModel from './Model/postInit'
import initSi from './Model/initConstr/subitem'
import isPrivate from './Model/isPrivateState'
import getLinedStructure from './Model/getLinedStructure'
import toSimpleStructure from './Model/toSimpleStructure'
import ensurePublicAttrs from './Model/ensurePublicAttrs'
import addrFromObj from './provoda/dcl/addr.js'
import getDepValue from './utils/multiPath/getDepValue'
import parseAddr from './utils/multiPath/parse'
import logger from './dx/logger'
import wrapInputCall from './provoda/wrapInputCall'

var push = Array.prototype.push
var cloneObj = spv.cloneObj

var getComplexInitList = updateProxy.getComplexInitList

var getMDOfReplace = function() {
  return this.md
}

var si_opts_cache = {}
var SIOpts = function(md) {
  this.map_parent = md
  this.app = md.app
}


var getSiOpts = function(md) {
  var provoda_id = md._provoda_id
  if (!si_opts_cache[provoda_id]) {
    si_opts_cache[provoda_id] = new SIOpts(md)
  }
  return si_opts_cache[provoda_id]
}

var changeSourcesByApiNames = function(md, store) {
  if (!store.api_names_converted) {
    store.api_names_converted = true
    for (var i = 0; i < store.api_names.length; i++) {
      var api_name = store.api_names[i]
      var network_api
      if (typeof api_name == 'string') {
        network_api = spv.getTargetField(md.app, api_name)
      } else if (typeof api_name == 'function') {
        network_api = api_name.call(md)
      }
      if (!network_api.source_name) {
        throw new Error('network_api must have source_name!')
      }

      store.sources_names.push(network_api.source_name)
    }
  }
}

var Model = spv.inh(StatesEmitter, {
  naming: function(fn) {
    return function Model(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },
  onExtend: onPropsExtend,
  init: initModel,
  postInit: postInitModel,
  props: modelProps
})

var selectParent = function(md) {
  return md.map_parent
}

var getStrucParent = function(item, _count, soft) {
  var count = _count || 1

  var target = item
  while (count) {
    count--
    target = selectParent(target)

    if (!target && !soft) {
      throw new Error('no parent for step ' + count)
    }
  }
  return target
}

function modelProps(add) {
add(_requestsDeps)
add({
  getNonComplexStatesList: function(state_name) {
    // get source states
    var short_name = hp.getShortStateName(state_name)

    if (!this.hasComplexStateFn(short_name)) {
      return short_name
    } else {
      var result = []
      for (var i = 0; i < this.compx_check[short_name].watch_list.length; i++) {
        var cur = this.compx_check[short_name].watch_list[i]
        if (cur == short_name) {
          continue
        } else {
          result.push(this.getNonComplexStatesList(cur))
        }

        //
        //Things[i]
      }
      return spv.collapseAll.apply(null, result)
    }
  },
  getNestingSource: function(nesting_name, app) {
    nesting_name = hp.getRightNestingName(this, nesting_name)
    var dclt = this._nest_reqs && this._nest_reqs[nesting_name]
    var network_api = dclt && hp.getNetApiByDeclr(dclt.send_declr, this, app)
    return network_api && network_api.source_name
  },
  getStateSources: function(state_name, app) {
    var parsed_state = hp.getEncodedState(state_name)
    if (parsed_state && parsed_state.rel_type == 'nesting') {
      return this.getNestingSource(parsed_state.nesting_name, app)
    } else {
      var maps_for_state = this._states_reqs_index && this._states_reqs_index[state_name]
      if (maps_for_state) {
        var result = new Array(maps_for_state.length)
        for (var i = 0; i < maps_for_state.length; i++) {
          var selected_map = maps_for_state[i]
          var network_api = hp.getNetApiByDeclr(selected_map.send_declr, this, app)
          result[i] = network_api.source_name
        }
        return result
      }
    }
  },
  getNetworkSources: function() {
    if (!this.netsources_of_all) {
      return
    }
    if (!this.netsources_of_all.done) {
      this.netsources_of_all.done = true
      this.netsources_of_all.full_list = []

      if (this.netsources_of_all.nestings) {
        changeSourcesByApiNames(this, this.netsources_of_all.nestings)
        push.apply(this.netsources_of_all.full_list, this.netsources_of_all.nestings.sources_names)
      }

      if (this.netsources_of_all.states) {
        changeSourcesByApiNames(this, this.netsources_of_all.states)
        push.apply(this.netsources_of_all.full_list, this.netsources_of_all.states.sources_names)
      }
    }

    return this.netsources_of_all.full_list
  },
  getStrucRoot: function() {
    return this.app
  },
  getStrucParent: function(count, soft) {
    return getStrucParent(this, count, soft)
  },
  getInstanceKey: function() {
    return this._provoda_id
  },
  getSiOpts: function() {
    return getSiOpts(this)
  },
  initChi: function(name, data, params, more, states) {
    var Constr = this._all_chi['chi-' + name]
    return initSi(Constr, this, data, params, more, states)
  },
  initSi: function(Constr, data, params, more, states) {
    return initSi(Constr, this, data, params, more, states)
  },
  mapStates: function(states_map, donor, acceptor) {
    if (acceptor && typeof acceptor == 'boolean') {
      if (this.init_states === false) {
        throw new Error('states inited already, you can\'t init now')
      }
      if (!this.init_states) {
        this.init_states = {}
      }
      acceptor = this.init_states
    }
    return spv.mapProps(states_map, donor, acceptor)
  },
  initState: function(state_name, state_value) {
    if (this.init_states === false) {
      throw new Error('states inited already, you can\'t init now')
    }
    if (this.hasComplexStateFn(state_name)) {
      throw new Error('you can\'t change complex state ' + state_name)
    }

    if (!this.init_states) {
      this.init_states = {}
    }
    this.init_states[state_name] = state_value
  },
  initStates: function(more_states) {
    if (!more_states) {
      return
    }

    if (this.init_states === false) {
      throw new Error('states inited already, you can\'t init now')
    }

    if (!this.init_states) {
      this.init_states = {}
    }
    cloneObj(this.init_states, more_states)
  },
  __initStates: function() {
    if (this.init_states === false) {
      throw new Error('states inited already, you can\'t init now')
    }

    var changes_list = getComplexInitList(this) || []
    changes_list.push('_provoda_id', this._provoda_id)

    if (this.init_states) {
      for (var state_name in this.init_states) {
        if (!this.init_states.hasOwnProperty(state_name)) {
          continue
        }

        if (this.hasComplexStateFn(state_name)) {
          throw new Error('you can\'t change complex state ' + state_name)
        }

        changes_list.push(state_name, this.init_states[state_name])
      }
    }

    prsStCon.prefill.self(this, changes_list)
    prsStCon.prefill.parent(this, changes_list)
    prsStCon.prefill.root(this, changes_list)

    if (changes_list && changes_list.length) {
      updateProxy(this, changes_list)
    }

    // this.updateManyStates(this.init_states);
    this.init_states = false
  },
  network_data_as_states: true,
  handling_v2_init: true,
  onExtend: spv.precall(StatesEmitter.prototype.onExtend, function(props, original, params) {
    onPropsExtend(this, props, original, params)
  }),
  getConstrByPathTemplate: function(app, path_template) {
    return initDeclaredNestings.getConstrByPath(app, this, path_template)
  },
  connectMPX: function() {
    if (!this.mpx) {
      this.mpx = new MDProxy(this._provoda_id, this.children_models, this)
    }
    return this.mpx
  },
  _assignPublicAttrs: function(target) {
    return ensurePublicAttrs.assignPublicAttrs(this, target)
  },
  getReqsOrderField: function() {
    if (!this.req_order_field) {
      this.req_order_field = ['mdata', 'm', this._provoda_id, 'order']
    }
    return this.req_order_field
  },
  getMDReplacer: function() {
    if (!this.md_replacer) {
      var MDReplace = function() {}
      MDReplace.prototype.md = this
      MDReplace.prototype.getMD = getMDOfReplace

      this.md_replacer = new MDReplace()
      this.md_replacer._provoda_id = this._provoda_id
    }
    return this.md_replacer
  },
  RPCLegacy: wrapInputCall(function() {
    var args = Array.prototype.slice.call(arguments)
    var method_name = args.shift()
    if (method_name == 'dispatch') {
      var fn = this.__act
      args.unshift(this)
      fn.apply(null, args)
      return
    }
    if (this.rpc_legacy && this.rpc_legacy[method_name]) {
      this.rpc_legacy[method_name].apply(this, args)
    } else {
      this[method_name].apply(this, args)

    }
  }),
  die: function() {
    prsStCon.disconnect.parent(this, this)
    prsStCon.disconnect.root(this, this)

    this.stopRequests()
    //this.mpx.die();
    this._highway.views_proxies.killMD(this)
    hp.triggerDestroy(this)
    this._highway.models[this._provoda_id] = null
    return this
  }
})

add({
  getRelativeRequestsGroups: function(space, only_models) {
    var all_models = []
    var groups = []

    var i = 0, cur = null
    for (var collection_name in this.children_models) {
      cur = this.children_models[collection_name]
      if (!cur) {
        continue
      }
      if (Array.isArray(cur)) {
        all_models.push.apply(all_models, cur)
      } else {
        all_models.push(cur)
      }
    }
    var clean_models = spv.getArrayNoDubs(all_models)

    if (only_models) {
      return clean_models
    } else {
      for (i = 0; i < clean_models.length; i++) {
        var reqs = clean_models[i].getModelImmediateRequests(space)
        if (reqs && reqs.length) {
          groups.push(reqs)
        }
      }
      return groups
    }
  },
  getNesting: function(collection_name) {
    return this.children_models && this.children_models[collection_name]
  },

  updateNesting: function(collection_name, array, opts, spec_data) {
    gentlyUpdateNesting(this, collection_name, array, opts, spec_data)
    return this
  },
  sendCollectionChange: function(collection_name, array, old_value, removed) {
    //this.removeDeadViews();
    logger.logNesting(this, collection_name, array, old_value, removed)
    var _highway = this._highway
    if (_highway.sync_sender != null) {
      _highway.sync_sender.pushNesting(this, collection_name, array, old_value, removed)
    }
    if (_highway.views_proxies != null) {
      this._highway.views_proxies.pushNesting(this, collection_name, array, old_value, removed)
    }
    if (this.mpx != null) {
      this.mpx.sendCollectionChange(collection_name, array, old_value, removed)
    }
  },

  sendStatesToMPX: function(states_list) {
    //this.removeDeadViews();
    var dubl = []

    for (var i = 0; i < states_list.length; i += 2) {
      var state_name = states_list[i]
      var value = states_list[i + 1]
      if (isPrivate(state_name)) {
        continue
      }
      dubl.push(state_name, value)
    }

    logger.logStates(this, dubl)
    var _highway = this._highway
    if (_highway.sync_sender != null) {
      _highway.sync_sender.pushStates(this, dubl)
    }
    if (_highway.views_proxies != null) {
      _highway.views_proxies.pushStates(this, dubl)
    }
    if (this.mpx != null) {
      this.mpx.stackReceivedStates(dubl)
    }
    //
  }})

add({
  getLinedStructure: getLinedStructure,
  toSimpleStructure: toSimpleStructure
})

var getParsedAddr = function(addr) {
  if (typeof addr == 'object') {
    return parseAddr(addrFromObj(addr))
  }
  return parseAddr(addr)
}

add({
  readAddr: function(addr) {
    var parsed = getParsedAddr(addr)
    return getDepValue(this, parsed)
  },
})
}

export default Model
