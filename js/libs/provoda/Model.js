

import spv from '../spv'
import hp from './helpers'
import MDProxy from './MDProxy'
import initDeclaredNestings from './initDeclaredNestings'
import prsStCon from './prsStCon'

import { initAttrs } from './updateProxy'
import StatesEmitter from './StatesEmitter'
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
import prefillCompAttr from './dcl/attrs/comp/prefill'
import regfr_light_rel_ev from './dcl/glue_rels/light_rel_change/regfire'
import { disposeGlueSources } from './dcl/glue_rels/runtime/run'
import disposeEffects from './dcl/effects/dispose'
import getDepValue from './utils/multiPath/getDepValue'
import parseAddr from './utils/multiPath/parse'
import logger from './dx/logger'
import wrapInputCall from './provoda/wrapInputCall'
import disposeMentions from './Model/mentions/dispose'
import checkAndDisposeModel from './Model/checkAndDisposeModel'
import {normalizeAddrsToValuesMap} from './Model/mockRelations'
import isPublicRel from './Model/rel/isPublicRel'
import createMutableRelStore from './Model/rel/createMutableRelStore'

const push = Array.prototype.push

const is_prod = typeof NODE_ENV != 'undefined' && NODE_ENV === 'production'

const getMDOfReplace = function() {
  return this.md
}

const si_opts_cache = {}
const SIOpts = function(md) {
  this.map_parent = md
  this.app = md.app
}


const getSiOpts = function(md) {
  const provoda_id = md._provoda_id
  if (!si_opts_cache[provoda_id]) {
    si_opts_cache[provoda_id] = new SIOpts(md)
  }
  return si_opts_cache[provoda_id]
}

const changeSourcesByApiNames = function(md, store) {
  if (!store.api_names_converted) {
    store.api_names_converted = true
    for (let i = 0; i < store.api_names.length; i++) {
      const api_name = store.api_names[i]
      let network_api
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


function MODELLEAK() {}

const leak = new MODELLEAK()


const Model = spv.inh(StatesEmitter, {
  strict: true,
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

const selectParent = function(md) {
  return md.map_parent
}

const getStrucParent = function(item, _count, soft) {
  let count = _count || 1

  let target = item
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

  add({
    effects: {
      out: {
        __remove_model: {
          api: ['self'],
          trigger: ['$meta$removed'],
          require: ['$meta$removed'],
          create_when: {
            api_inits: true,
          },
          fn: function(self, { value }) {
            checkAndDisposeModel(self, value)
          }
        }
      }
    },
  })

  add({
    'regfr-light_rel_ev': regfr_light_rel_ev,

    getNonComplexStatesList: function(state_name) {
    // get source states
      const short_name = state_name

      if (!this.hasComplexStateFn(short_name)) {
        return short_name
      } else {
        const result = []
        for (let i = 0; i < this.compx_check[short_name].watch_list.length; i++) {
          const cur = this.compx_check[short_name].watch_list[i]
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
      const dclt = this._nest_reqs && this._nest_reqs[nesting_name]
      const network_api = dclt && hp.getNetApiByDeclr(dclt.send_declr, this, app)
      return network_api && network_api.source_name
    },
    getStateSources: function(state_name, app) {
      const parsed_state = hp.getEncodedState(state_name)
      if (parsed_state && parsed_state.rel_type == 'nesting') {
        return this.getNestingSource(parsed_state.nesting_name, app)
      } else {
        const maps_for_state = this._states_reqs_index && this._states_reqs_index[state_name]
        if (maps_for_state) {
          const result = new Array(maps_for_state.length)
          for (let i = 0; i < maps_for_state.length; i++) {
            const selected_map = maps_for_state[i]
            const network_api = hp.getNetApiByDeclr(selected_map.send_declr, this, app)
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
    initChi: function(name, data) {
      const Constr = this._all_chi['chi-' + name]
      return initSi(Constr, this, data)
    },
    initSi: function(Constr, data) {
      return initSi(Constr, this, data)
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
      Object.assign(this.init_states, more_states)
    },
    __initStates: function() {
      if (this.init_states === false) {
        throw new Error('states inited already, you can\'t init now')
      }

      const changes_list = []

      changes_list.push('_provoda_id', this._provoda_id)

      if (this.init_states) {
        for (const state_name in this.init_states) {
          if (!this.init_states.hasOwnProperty(state_name)) {
            continue
          }

          if (this.hasComplexStateFn(state_name)) {
            throw new Error('you can\'t change complex state ' + state_name)
          }

          changes_list.push(state_name, this.init_states[state_name])
        }
      }

      const mock = Boolean(this.mock_relations)
      if (is_prod || !mock) {
        prefillCompAttr(this, changes_list)
      }


      if (changes_list && changes_list.length) {
        initAttrs(this, this._fake_etr, changes_list)
      }

    // this.updateManyStates(this.init_states);
      this.init_states = false
    },
    handling_v2_init: true,
    onExtend: spv.precall(StatesEmitter.prototype.onExtend, function(props, original, params) {
      onPropsExtend(this, props, original, params)
    }),
    getConstrByPathTemplate: function(app, path_template) {
      return initDeclaredNestings.getConstrByPath(app, this, path_template)
    },
    connectMPX: function() {
      if (!this.mpx) {
        this.mpx = new MDProxy(this._provoda_id, createMutableRelStore(this), this)
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
        const MDReplace = function() {}
        MDReplace.prototype.md = this
        MDReplace.prototype.getMD = getMDOfReplace

        this.md_replacer = new MDReplace()
        this.md_replacer._provoda_id = this._provoda_id
      }
      return this.md_replacer
    },
    RPCLegacy: wrapInputCall(function() {
      const args = Array.prototype.slice.call(arguments)
      const method_name = args.shift()
      if (method_name == 'dispatch') {
        const fn = this.__act
        args.unshift(this)
        fn.apply(null, args)
        return
      }
      if (this.rpc_legacy && this.rpc_legacy[method_name]) {
        this.rpc_legacy[method_name].apply(this, args)
      } else if (this[method_name]) {
        this[method_name].apply(this, args)
      } else {
        console.error(new Error('missing method: ' + method_name), this.__code_path)
      }
    }),
    wasDisposed: function() {
      return Boolean(this.dead)
    },
    die: function() {
      if (this.dead != false) {
        return
      }

      prsStCon.disconnect.parent(this, this)
      prsStCon.disconnect.root(this, this)

      disposeGlueSources(this)
      disposeEffects(this)
      disposeMentions(this)

      this.stopRequests()
    //this.mpx.die();
    // send to views
      this._highway.views_proxies.killMD(this)
      hp.triggerDestroy(this)

      this.dead = leak

      this._highway.models[this._provoda_id] = null
      return this
    }
  })

  add({
    getRelativeRequestsGroups: function(space, only_models) {
      const all_models = []
      const groups = []

      let i = 0
      let cur = null
      for (const collection_name in this.children_models) {
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
      const clean_models = spv.getArrayNoDubs(all_models)

      if (only_models) {
        return clean_models
      } else {
        for (i = 0; i < clean_models.length; i++) {
          const reqs = clean_models[i].getModelImmediateRequests(space)
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
      const is_public_rel = isPublicRel(this, collection_name)
      if (is_public_rel) {
        logger.logNesting(this, collection_name, array, old_value, removed)
      }
      const _highway = this._highway
      if (_highway.sync_sender != null) {
        _highway.sync_sender.pushNesting(this, collection_name, array, old_value, removed)
      }
      if (_highway.views_proxies != null) {
        this._highway.views_proxies.pushNesting(this, collection_name, array, old_value, removed)
      }
      if (is_public_rel && this.mpx != null) {
        this.mpx.sendCollectionChange(collection_name, array, old_value, removed)
      }
    },

    sendStatesToMPX: function(states_list) {
    //this.removeDeadViews();
      const dubl = []

      for (let i = 0; i < states_list.length; i += 2) {
        const state_name = states_list[i]
        const value = states_list[i + 1]
        if (isPrivate(state_name)) {
          continue
        }
        dubl.push(state_name, value)
      }

      logger.logStates(this, dubl)
      const _highway = this._highway
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

  const getParsedAddr = function(addr) {
    if (typeof addr == 'object') {
      return parseAddr(addrFromObj(addr))
    }
    return parseAddr(addr)
  }

  add({
    readAddr: function(addr) {
      const parsed = typeof addr === 'string' ? getParsedAddr(addr) : addr
      return getDepValue(this, parsed)
    },
  })

  if (!is_prod) {
    add({
      __updateRelationMocks: function(map) {
        const values = normalizeAddrsToValuesMap(map)
        this.updateManyStates(values)
      }
    })
  }
}
export default Model
