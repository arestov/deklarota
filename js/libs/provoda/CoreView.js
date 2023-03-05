

import spv from '../spv'

import _updateAttrsByChanges from './_internal/_updateAttrsByChanges'
import groupMotive from './helpers/groupMotive'
import triggerDestroy from './helpers/triggerDestroy'
import updateProxy from './updateProxy'
import AttrsOwner from './AttrsOwner/AttrsOwner'
import onPropsExtend from './View/onExtend'
import selectCollectionChange from './View/selectCollectionChange'
import initApis from './dcl/effects/legacy/api/init'
import disposeEffects from './dcl/effects/dispose'

import initInputAttrs from './dcl/attrs/input/init'
import prefillCompAttr from './dcl/attrs/comp/prefill'
import nestBorrowInit from './dcl_view/nest_borrow/init'
import nestBorrowDestroy from './dcl_view/nest_borrow/destroy'
import nestBorrowCheckChange from './dcl_view/nest_borrow/check-change'
import initSpyglasses from './dcl_view/spyglass/init'
import getBwlevView from './dcl_view/getBwlevView'
import getViewLocationId from './View/getViewLocationId'
import makeAttrsCollector from './View/makeAttrsCollector'
import getRelPath from './View/getRelPath'
import { connectViewExternalDeps, disconnectViewExternalDeps } from './dcl/attrs/comp/runtime/connectViewExternalDeps'
import { stopRequests } from './dcl/effects/legacy/api/requests_manager'
import { ViewFlowStepTickDetailsRequest } from './View/viewFlowStepHandlers.types'
import requestState, { resetRequestedState } from './FastEventor/requestState'
import { events_part, initEvents } from './View/events_part'
import ___dkt_onAttrUpdate from './View/___dkt_onAttrUpdate'
import ___dkt_saveInputFxTargetedResult from './dcl/effects/legacy/subscribe/run/view/___dkt_saveInputFxTargetedResult'
import ensureInitialAttrs from './View/ensureInitialAttrs'
import spvExtend from '../spv/inh'

const CH_GR_LE = 2


// var spyglassDestroy = require('./dcl_view/spyglass/destroy');

const ViewLabour = function() {
  this.has_details = null
  this._detailed = null
  this.dettree_incomplete = null
  this.detltree_depth = null
  this._states_set_processing = null
  this._collections_set_processing = null
  this.innesting_pos_current = null
  this.innest_prev_view = null
  this.innest_next_view = null

  this.demensions_key_start = null

  this._anchor = null
  //this.innesting_pos_old = null;

  this.detached = null

  this.hndTriggerTPLevents = null
  this.hndPvTypeChange = null
  this.hndPvTreeChange = null

  this.marked_as_dead = null


  this.undetailed_states = {}
  this.undetailed_children_models = {}
  this.__sync_hooks = null
  this.__sync_nest_hooks = null
}

const emptyArray = Object.freeze([])

const mutateChildren = (target) => {
  if (Object.isFrozen(target.children)) {
    target.children = []
  }

  return target.children
}

export const __tickDetRequest = function() {
  if (!this.isAlive()) {
    return
  }
  this._lbr.dettree_incomplete = this.requestDetalizationLevel(this._lbr.detltree_depth)
  this._lbr.detltree_depth++
  if (this._lbr.dettree_incomplete) {
    this.nextLocalTick(ViewFlowStepTickDetailsRequest, null, true)
  }
}

const initView = function(target, view_otps, opts) {
  initEvents(target)

  target.used_data_structure = view_otps.used_data_structure || target.used_data_structure

  target.tpl = null
  target.c = null

  target.dead = null
  target.pv_view_node = null
  target.dclrs_fpckgs = target.dclrs_fpckgs
  // target.dclrs_selectors = null;
  target.base_skeleton = null

  target.nesting_space = view_otps.nesting_space
  target.nesting_name = view_otps.nesting_name
  target.by_model_name = Boolean(view_otps.by_model_name)

  target.parent_view = null
  if (view_otps.parent_view) {
    target.parent_view = view_otps.parent_view
  }
  target.root_view = null
  if (view_otps.root_view) {
    target.root_view = view_otps.root_view
  }

  target._highway = view_otps._highway || target.parent_view._highway || target.root_view._highway
  target.view_id = target._highway.views_counter++
  target._calls_flow = target._highway.calls_flow
  target._local_calls_flow = target._highway.local_calls_flow

  target.opts = null
  if (opts) {
    target.opts = opts
  }

  target.children = emptyArray

  if (target.parent_view && !view_otps.location_name) {
    throw new Error('give me location name!')
    //используется для идентификации использования одной и тойже view внутри разнородных родительских view или разных пространств внутри одного view
  }
  target.location_name = view_otps.location_name
  if (!view_otps.mpx) {
    throw new Error('give me model!')
  }

  target.mpx = view_otps.mpx
  target.proxies_space = (target.parent_view && target.parent_view.proxies_space) || view_otps.proxies_space || null

  makeAttrsCollector(target)

  target.way_points = null

  target.dom_related_props = null
  if (target.dom_rp) {
    target.dom_related_props = []
  }
  target._lbr = new ViewLabour()

  target._lbr.undetailed_states['$entry'] = target.mpx

  target.mpx._assignPublicAttrs(target._lbr.undetailed_states)
  Object.assign(target._lbr.undetailed_states, target.mpx.vstates)
  const default_attrs = initInputAttrs(target)
  if (default_attrs) {
    Object.assign(target._lbr.undetailed_states, default_attrs)
  }

  ensureInitialAttrs(target)

  const changes_list = []
  Array.prototype.push.apply(changes_list, target._fake_etr.total_ch)
  prefillCompAttr(target, changes_list)

  for (let i = 0; i < changes_list.length; i += CH_GR_LE) {
    target._lbr.undetailed_states[changes_list[i]] = changes_list[i + 1]
  }

  Object.assign(target._lbr.undetailed_children_models, target.mpx.nestings)

  connectViewExternalDeps(target)

  nestBorrowInit(target)
  initSpyglasses(target)

  if (target.__connectAdapter) {
    target.__connectAdapter.call(null, target)
  }

  initApis(target, opts && opts.interfaces)
  if (target.isRootView) {
    const parent_opts = target.parent_view && target.parent_view.opts
    if (parent_opts) {
      for (const interface_name in parent_opts.interfaces) {
        target.useInterface(interface_name, parent_opts.interfaces[interface_name])
      }
    }

  }


}


const getSpyglassData = function(current_view, target_id, probe_name, value, req) {
  const parent_bwlev_view = getBwlevView(current_view)

  const data = {
    context_md: parent_bwlev_view && parent_bwlev_view.getNesting('pioneer')._provoda_id,
    bwlev: parent_bwlev_view && parent_bwlev_view.mpx.md._provoda_id,
    target_id: target_id,
    probe_name: probe_name,
    value: value,
    req: req,
    probe_container_uri: null,
  }

  return data
}

const changeSpyglassUniversal = function(method) {
  return function(_e, _node, probe_name, value, req) {
    const data = getSpyglassData(this, this.mpx._provoda_id, probe_name, value, req)

    const bwlev_view = this.root_view.parent_view
    bwlev_view.RPCLegacy(method, data)
  }
}

const changeSpyglassUniversalM = function(method) {
  return function(probe_name, target_id, value, req) {
    const data = getSpyglassData(this, target_id, probe_name, value, req)

    const bwlev_view = this.root_view.parent_view
    bwlev_view.RPCLegacy(method, data)
  }
}

const selectParent = function(view) {
  return view.parent_view
}

const getStrucParent = function(item, _count) {
  let count = _count || 1

  let target = item
  while (count) {
    count--
    target = selectParent(target)

    if (!target) {
      throw new Error('no parent for step ' + count)
    }
  }
  return target
}

const emptyFakeList = {length:0}

const getSessionRoot = (self) => self.root_view.parent_view

const getContextRouter = (self) => {
  const bwlev_view = getBwlevView(self)
  const current_bwlev_map = (bwlev_view && bwlev_view.getNesting('map'))
  const context_router = current_bwlev_map || getSessionRoot(self)
  return context_router
}

const View = spvExtend(AttrsOwner, {
  naming: function(fn) {
    return function View(view_otps, opts) {
      fn(this, view_otps, opts)
    }
  },
  init: initView,
  onExtend: onPropsExtend
}, {
  ...events_part,
  __isView: true,
  ___attrsToSync: function() {
    if (this._lbr.undetailed_states) {
      return this._lbr.undetailed_states
    }

    return this.states
  },
  requestState,
  resetRequestedState,
  requestPageById: function(_provoda_id) {
    this.root_view.parent_view.RPCLegacy('requestPage', _provoda_id)
  },
  requestPage: function() {
    const md_id = this.mpx._provoda_id

    this.root_view.parent_view.RPCLegacy('requestPage', md_id)
  },
  navShowByReq: function(reqId, goal, options, data) {
    const router_name = options && options.router
    const remember_context = !options || options.remember_context !== false

    const bwlev_view = getBwlevView(this)

    const context_bwlev_id = remember_context
      ? (bwlev_view && bwlev_view.mpx._provoda_id)
      : null
    const current_bwlev_id = remember_context
      ? (bwlev_view && bwlev_view.getNesting('map').getNesting('current_mp_bwlev')._provoda_id)
      : null

    this.root_view.parent_view.RPCLegacy('navShowByReq', {
      id: reqId,
      goal: goal,
      data: data,
      remember_context: remember_context,
      context_bwlev_id,
      current_bwlev_id,
    }, router_name)
  },
  navCheckGoalToGetBack: function(goal) {
    const bwlev_view = getBwlevView(this)
    bwlev_view.RPCLegacy('navCheckGoalToGetBack', goal)
  },
  navGetBack: function() {
    const bwlev_view = getBwlevView(this)
    bwlev_view.RPCLegacy('navGetBack')
  },
  getBwlevView() {
    return getBwlevView(this)
  },
  tpl_events: {
    updateState: function(_e, _node, state_name, value) {
      this.updateState(state_name, value)
    },
    updateAttr: function(_e, _node, state_name, value) {
      this.updateAttr(state_name, value)
    },

    navigateToResource() {
      const contextRouter = getContextRouter(this)
      contextRouter.RPCLegacy('navigateToResource', this.mpx._provoda_id)
    },
    navigateByLocator(_e, _node, locator) {
      const contextRouter = getContextRouter(this)
      contextRouter.RPCLegacy('navigateByLocator', this.mpx._provoda_id, locator)
    },
    navigateRouterToResource(_e, _node, router) {
      const session_root = getSessionRoot(this)
      session_root.RPCLegacy('navigateRouterToResource', this.mpx._provoda_id, router)
    },
    navigateRouterByLocator(_e, _node, router, locator) {
      const session_root = getSessionRoot(this)
      session_root.RPCLegacy('navigateRouterByLocator', this.mpx._provoda_id, router, locator)
    },
    expectRelBeRevealedByRelPath(_e, _node, rel_path, goal) {
      const contextRouter = getContextRouter(this)
      const current_md_id = this.mpx._provoda_id

      const bwlev_view = goal && getBwlevView(this)

      const currentReq = goal ? {
        goal,
        context_bwlev_id: bwlev_view && bwlev_view.mpx._provoda_id,
        current_bwlev_id: (bwlev_view && bwlev_view.getNesting('map').getNesting('current_mp_bwlev')._provoda_id),
      } : null

      contextRouter.RPCLegacy('dispatch', 'expectRelBeRevealedByRelPath', {rel_path, current_md_id, currentReq})
    },
    expectRouterRevealRel(_e, _node, router, rel_path) {
      const session_root = getSessionRoot(this)
      const current_md_id = this.mpx._provoda_id
      session_root.RPCLegacy('expectRouterRevealRel', current_md_id, router, rel_path)
    },
    navigateToResourceByStacking(_e, _node) {
      const id = this.mpx._provoda_id
      const bwlev_view = getBwlevView(this)
      bwlev_view.RPCLegacy('dispatch', 'navigateToResourceByStacking', { target_id: id })
    },
    requestPage: function() {
      this.requestPage()
    },
    navigateToNavParent() {
      const bwlev_view = getBwlevView(this)
      bwlev_view.RPCLegacy('dispatch', 'navigateToNavParent')
    },
    requestPageById: function(_e, _node, _provoda_id) {
      this.requestPageById(_provoda_id)
    },
    toggleSpyglass: changeSpyglassUniversal('toggleSpyglass'),
    updateSpyglass: changeSpyglassUniversal('updateSpyglass'),
    _log: (function() {


      return function(_e, _node, message) {
        console.log(message, `${getRelPath(this)}\n`, this)
      }
    }())
  },
  updateSpyglass: changeSpyglassUniversalM('updateSpyglass'),
  toggleSpyglass: changeSpyglassUniversalM('toggleSpyglass'),
  getSpyglassData: getSpyglassData,
  onExtend: spv.precall(AttrsOwner.prototype.onExtend, function(md, props, original, params) {
    return onPropsExtend(md, props, original, params)
  }),
  getStrucRoot: function() {
    return this.root_view
  },
  getStrucParent: function(count) {
    return getStrucParent(this, count)
  },
  getInstanceKey: function() {
    return this.view_id
  },
  getNesting: function(collection_name) {
    return this.mpx.nestings[collection_name]
  },
  demensions_cache: {},
  checkDemensionsKeyStart: function() {
    if (!this._lbr.demensions_key_start) {
      const arr = []
      let cur = this
      while (cur.parent_view) {
        arr.push(cur.location_name)

        cur = cur.parent_view
      }
      arr.reverse()
      this._lbr.demensions_key_start = arr.join(' ')

      //this._lbr.demensions_key_start = this.location_name + '-' + (this.parent_view && this.parent_view.location_name + '-');
    }
  },
  getBoxDemensionKey: function() {
    const args = new Array(arguments.length) //optimization
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i]

    }
    this.checkDemensionsKeyStart()
    return this._lbr.demensions_key_start.concat(args.join('-'))

  },
  getBoxDemensionByKey: function(cb, key) {
    if (typeof this.demensions_cache[key] == 'undefined') {
      this.demensions_cache[key] = cb.call(this)
    }
    return this.demensions_cache[key]
  },
  getBoxDemension: function(cb) {
    const args = new Array(arguments.length - 1)
    for (let i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i]
    }


    const key = this.getBoxDemensionKey.apply(this, args)
    return this.getBoxDemensionByKey(cb, key)
  },
  getStoredMpx: function(md) {
    if (md.stream) {
      return md.mpx
    } else {
      // getModel
      const space = this.proxies_space || this.root_view.proxies_space
      return this._highway.views_proxies.getMPX(space, md)
    }
    //

  },
  RPCLegacy: function() {
    this.mpx.RPCLegacy.apply(this.mpx, arguments)
  },
  children_views: {},
  connectChildrenModels: groupMotive(function() {
    const udchm = this._lbr.undetailed_children_models
    this._lbr.undetailed_children_models = null
    this.setMdChildren(udchm)

  }),
  connectStates: function() {
    const states = this._lbr.undetailed_states
    this._lbr.undetailed_states = null
    this._setStates(states)

  },
  createTemplate: function() {
    // dom
  },
  createDetails: function() {
    // dom or developers
  },
  appendCon: function() {
    // dom
  },
  requestDetailesCreating: function() {
    if (!this._lbr.has_details) {
      this._lbr.has_details = true
      this.createDetails()
    }
  },
  requestDetailes: function() {
    this.requestDetailesCreating()
    this._lbr._detailed = true
    if (!this.manual_states_connect) {
      this.connectChildrenModels()
      this.connectStates()
    }
    this.appendCon()
  },

  getFreeCV: function(child_name, view_space, opts) {
    const md = this.getMdChild(child_name)
    if (md) {
      const view = this.getFreeChildView({
        by_model_name: false,
        nesting_name: child_name,
        nesting_space: view_space
      }, md, opts)
      return view
    } else {
      throw new Error('there is no ' + child_name + ' child model')
    }
  },
  getAFreeCV: function(child_name, view_space, opts) {
    const view = this.getFreeCV(child_name, view_space, opts)
    if (view) {
      const anchor = view.getA()
      if (anchor) {
        return anchor
      } else {
        throw new Error('there is no anchor for view of ' + child_name + ' child model')
      }
    }

  },
  getFreeChildView: function(address_opts, md, opts) {
    const mpx = this.getStoredMpx(md)
    const
      child_name = address_opts.nesting_name
    const view_space = address_opts.nesting_space || 'main'
    const location_id = getViewLocationId(this, address_opts.nesting_name, view_space)
    let view = mpx.getView(location_id)

    if (view) {
      return false
    } else {

      let ConstrObj
      const controller_name = address_opts.controller_name
      if (controller_name) {
        ConstrObj = this.root_view.controllers && this.root_view.controllers[controller_name]
        if (!ConstrObj) {
          throw new Error('controller `' + controller_name +
            '` should be defined in root_view.controllers')
        }
      } else if (address_opts.by_model_name) {

        ConstrObj = this.children_views_by_mn &&
          (this.children_views_by_mn[address_opts.nesting_name][md.model_name] ||
          this.children_views_by_mn[address_opts.nesting_name]['$default'])

      } else {
        ConstrObj = this.children_views[address_opts.nesting_name]
      }


      let Constr
      if (typeof ConstrObj == 'function' && view_space == 'main') {
        Constr = ConstrObj
      } else if (ConstrObj) {
        Constr = ConstrObj[view_space]
      }
      if (!Constr && address_opts.sampleController) {
        Constr = address_opts.sampleController
      }
      if (!Constr) {
        console.error('there is no View for', md.model_name, address_opts)
        throw new Error('there is no View for ' + address_opts.nesting_name)
      }

      let used_data_structure

      if (this.used_data_structure) {

        const field_path = address_opts.by_model_name ? ['children_by_mn', child_name, md.model_name, view_space] : ['children', child_name, view_space]
        //$default must be used too
        let sub_tree = this.used_data_structure.constr_children && spv.getTargetField(this.used_data_structure.constr_children, field_path)

        if (!sub_tree) {
          sub_tree = this.used_data_structure.tree_children && spv.getTargetField(this.used_data_structure.tree_children, field_path)
        }
        if (!sub_tree) {
          //debugger;
        }

        used_data_structure = sub_tree
      }

      const view_otps = {
        mpx: mpx,
        parent_view: this,
        root_view: this.root_view,
        location_name: child_name + '-' + view_space,
        nesting_space: view_space,
        nesting_name: child_name,
        by_model_name: address_opts.by_model_name,
        used_data_structure: used_data_structure
      }

      view = new Constr(view_otps, opts)
      if (view.init) {
        view.init(view_otps, opts)
      }

      mpx.addView(view, location_id)
      this.addChildView(view, child_name)
      return view
    }
  },
  addChildView: function(view) {
    mutateChildren(this)

    this.children.push(view)
    //fixme - possible memory leak when child is dead (this.children)
  },
  getChildViewsByMpx: function(mpx, nesting_name) {
    const result = []
    const views = mpx.getViews()
    let i = 0
    for (i = 0; i < this.children.length; i++) {
      const cur = this.children[i]
      if (views.indexOf(cur) != -1 && (!nesting_name || (cur.nesting_name == nesting_name))) {
        result.push(cur)
      }

    }
    return result
  },
  removeChildViewsByMd: function(mpx, nesting_name) {
    const views_to_remove = this.getChildViewsByMpx(mpx, nesting_name)
    let i = 0
    for (i = 0; i < views_to_remove.length; i++) {
      views_to_remove[i].die()
    }
    this.children = spv.arrayExclude(this.children, views_to_remove)

  },
  getDeepChildren: function(exept) {
    const all = []
    const big_tree = []
    exept = spv.toRealArray(exept)

    big_tree.push(this)
    //var cursor = this;
    while (big_tree.length) {
      const cursor = big_tree.shift()

      for (let i = 0; i < cursor.children.length; i++) {
        const cur = cursor.children[i]
        if (all.indexOf(cur) == -1 && exept.indexOf(cur) == -1) {
          big_tree.push(cur)
          all.push(cur)
        }
      }

    }
    return all
  },

  checkDeadChildren: function() {
    let i = 0
    const alive = []
    for (i = 0; i < this.children.length; i++) {
      if (this.children[i].dead) {
        //dead.push(this.children[i]);
      } else {
        alive.push(this.children[i])
      }
    }
    if (alive.length != this.children.length) {
      this.children = alive
    }

  },
  markAsDead: function(skip_md_call) {
    if (this.__marked_as_dead) {
      return
    }

    this.__marked_as_dead = true

    if (this.__disconnectAdapter) {
      this.__disconnectAdapter.call(null, this)
    }

    let i = 0
    if (!this.parent_view && this.proxies_space) {
      this._highway.views_proxies.removeSpaceById(this.proxies_space)
    }
    this.dead = true //new DeathMarker();
    stopRequests(this)

    triggerDestroy(this)
    if (!skip_md_call) {
      this.mpx.removeDeadViews()
    }

    this.markDomDead()

    const children = this.children
    this.children = emptyFakeList
    for (i = 0; i < children.length; i++) {
      children[i].markAsDead()
    }
    //debugger?


  },
  domDie: function() {

  },
  markDomDead: function() {

  },
  wasDisposed: function() {
    return Boolean(this._lbr.marked_as_dead)
  },
  die: function(opts) {
    if (this._lbr.marked_as_dead) {
      return this
    }

    disconnectViewExternalDeps(this)


    disposeEffects(this)


    this.domDie()
    this.markAsDead(opts && opts.skip_md_call)
    nestBorrowDestroy(this)
    this._lbr.marked_as_dead = true
    // spyglassDestroy(this)

    return this
  },
  requestView: function() {
    this.requestAll()
  },
  requestAll: groupMotive(function() {
    return this.requestDeepDetLevels()
  }),
  requestDeepDetLevels: function() {

    if (this._lbr._states_set_processing || this._lbr._collections_set_processing) {
      return this
    }
    //iterate TREE
    this._lbr.detltree_depth = 1
    this._lbr.dettree_incomplete = true



    this.nextLocalTick(ViewFlowStepTickDetailsRequest, null, true)

    return this
  },
  softRequestChildrenDetLev: function(rel_depth) {
    if (this._lbr._states_set_processing || this._lbr._collections_set_processing) {
      return this
    }
    this.requestChildrenDetLev(rel_depth)
  },
  requestChildrenDetLev: function(rel_depth) {
    let incomplete = false
    if (this.children.length && rel_depth === 0) {
      return true
    } else {
      for (let i = 0; i < this.children.length; i++) {
        const cur = this.children[i]
        const cur_incomplete = cur.requestDetalizationLevel(rel_depth)
        incomplete = incomplete || cur_incomplete
      }
      return incomplete
    }
  },
  requestDetalizationLevel: function(rel_depth) {
    if (!this._lbr._detailed) {
      this.requestDetailes()
    }
    return this.requestChildrenDetLev(rel_depth - 1)
  },
  isAliveFast: function() {
    return !this.dead
  },
  isAlive: function() {
    return this.isAliveFast()
  },
  _setStates: groupMotive(function(states) {
    this._lbr._states_set_processing = true
    //disallow chilren request untill all states will be setted

    this.states = this._attrs_collector.makeAttrsValues()
    //var _this = this;


    //var complex_states = [];


    const states_list = []

    for (const name in states) {
      states_list.push(name, states[name])
    }

    this._updateProxy(states_list)
    this._lbr._states_set_processing = null
    return this
  }),
  stackReceivedChanges: (function() {
    return function() {
      if (!this.isAlive()) {
        return
      }

      const args = new Array(arguments.length)
      for (let i = 0; i < arguments.length; i++) {
        args[i] = arguments[i]
      }
      args.unshift(this)

      this.input(updateProxy, args)

      if (this.__syncStates) {
        this.input(this.__syncStates, args)
      }
    }
  })(),
  __hookStateSync: function(fn) {
    if (!this.__sync_hooks) {
      this.__sync_hooks = []
    }

    // TODO: subscribe to die event

    this.__sync_hooks.push(fn)
  },
  __unhookStateSync: function(fn) {
    this.__sync_hooks = spv.arrayExclude(this.__sync_hooks, fn)
  },
  __changesToObject: function(changes_list) {
    let result = {}
    for (let i = 0; i < changes_list.length; i += CH_GR_LE) {
      result[changes_list[i]] = changes_list[i + 1]
      result = result
    }

    return result
  },
  __handleHookedSync: function(self, changes, all) {
    if (!self.__sync_hooks) {
      return
    }

    for (let i = 0; i < self.__sync_hooks.length; i++) {
      self.__sync_hooks[i].call(null, self, changes, all)
    }
  },
  receiveStatesChanges: groupMotive(function(changes_list, opts) {
    if (!this.isAlive()) {
      return
    }
    updateProxy(this, changes_list, opts)
  }),
  promiseStateUpdate: function(name, value) {
    updateProxy(this, [name, value])
  },
  checkChildrenModelsRendering: function() {
    const obj = Object.assign({}, this.mpx.nestings)
    this.setMdChildren(obj)
  },
  setMdChildren: function(collections) {
    this._lbr._collections_set_processing = true
    //вью только что создана, присоединяем подчинённые views без деталей (детали создаются позже)
    for (const i in collections) {
      this.collectionChange(this, i, collections[i])
    }
    this._lbr._collections_set_processing = null
  },
  getMdChild: function(name) {
    return this.getNesting(name)
  },
  pvserv: {
    simple: {

    },
    bymodel: {

    }
  },
  appendFVAncorByVN: function(opts) {
    this.getFreeChildView({
      by_model_name: opts.by_model_name,
      nesting_name: opts.name,
      nesting_space: opts.space
    }, opts.md, opts.opts)

  },
  stackCollectionChange: function() {
    const args = new Array(arguments.length)
    for (let i = 0; i < arguments.length; i++) {
      args[i] = arguments[i]
    }
    args.unshift(this)

    this.inputWithContext(this.collectionChange, args)
  },
  collectionChange: function(target, nesname, items, rold_value, removed) {
    /*
      - rold_value makes no sense during initialization
      - rold_value should be passed during live changes
    */

    if (!target.isAlive()) {
      return
    }
    if (target._lbr.undetailed_children_models) {
      target._lbr.undetailed_children_models[nesname] = items
      return target
    }

    selectCollectionChange(target, nesname, items, removed, rold_value)

    target.checkDeadChildren()
    nestBorrowCheckChange(target, nesname, items, rold_value, removed)
    return target
  },
  removeViewsByMds: function(array, nesname, space) {
    if (!array) {
      return
    }
    const location_id = getViewLocationId(this, nesname, space || 'main')
    for (let i = 0; i < array.length; i++) {

      const mpx = this.getStoredMpx(array[i])
      // case when model was removed before nesting updated
      // TODO: consider to review order of state changes
      const view = mpx && mpx.getView(location_id)
      if (!view) {
        continue
      }
      view.die()
    }
  },
  callCollectionChangeDeclaration: function(dclr_fpckg, nesname, array, old_value, removed) {
    if (typeof dclr_fpckg == 'function') {
      dclr_fpckg.call(this, nesname, array, old_value, removed)
    } else {

      const real_array = spv.toRealArray(array)
      let array_limit
      if (dclr_fpckg.limit) {
        array_limit = Math.min(dclr_fpckg.limit, real_array.length)
      } else {
        array_limit = real_array.length
      }
      const min_array = real_array.slice(0, array_limit)
      const declr = dclr_fpckg
      if (typeof declr.place == 'string') {
        const place = spv.getTargetField(this, declr.place)
        if (!place) {
          throw new Error('wrong place declaration: "' + declr.place + '"')
        }
      }
      const opts = declr.opts
      this.removeViewsByMds(removed, nesname, declr.space)
      if (typeof declr.place == 'function' || !declr.place) {
        this.simpleAppendNestingViews(declr, opts, nesname, min_array)
        if (!dclr_fpckg.not_request) {
          this.requestAll()
        }
      } else {
        this.appendNestingViews(declr, opts, nesname, min_array, dclr_fpckg.not_request)
      }
    }
    this.__injecViewMetaStates.call(null, this, nesname, dclr_fpckg.space, array)

    this.__handleHookedNestSync.call(null, this, nesname, dclr_fpckg.space, array)

  },

  __injecViewMetaStates: function(self, nesting_name, _space, items) {

    const location_id = getViewLocationId(self, nesting_name, 'main')
    const array = spv.toRealArray(items)


    let real_length = 0
    for (let i = 0; i < array.length; i++) {
      const cur = array[i]

      const view = self.getStoredMpx(cur).getView(location_id)
      if (!view) {
        continue
      }

      real_length++


    }

    let counter = 0
    for (let i = 0; i < array.length; i++) {
      const cur = array[i]

      const view = self.getStoredMpx(cur).getView(location_id)
      if (!view) {
        continue
      }

      const $first = counter == 0
      const $back = (real_length - 1) - counter
      const $last = $back == 0

      // Should it be with as input, not internal state change?
      _updateAttrsByChanges(view, [
        '$index', counter,
        '$index_back', $back,
        '$first', $first,
        '$last', $last,
        '$middle', !($first || $last),
      ])

      counter++
    }
  },

  __handleHookedNestSync: function(self, nesting_name, space, items) {
    if (!self.__sync_nest_hooks ||
      !self.__sync_nest_hooks[nesting_name] ||
      !self.__sync_nest_hooks[nesting_name].length) {
      return
    }

    if (space && space !== 'main') {
      return
    }

    const views = self.__mapListToViews(nesting_name, items)

    for (let i = 0; i < self.__sync_nest_hooks[nesting_name].length; i++) {
      self.__sync_nest_hooks[nesting_name][i].call(null, views)
    }
  },
  __mapListToViews: function(nesting_name, items) {
    const self = this
    const location_id = getViewLocationId(this, nesting_name, 'main')
    const array = spv.toRealArray(items)
    const views = array
      .map(function(cur) {
        return self.getStoredMpx(cur).getView(location_id)
      })
      .filter(Boolean)

    return views
  },
  __viewsList: function(nesting_name) {
    return this.__mapListToViews(nesting_name, this.getNesting(nesting_name))
  },
  __hookNestSync: function(nesting_name, fn) {
    if (!this.__sync_nest_hooks) {
      this.__sync_nest_hooks = {}
    }
    if (!this.__sync_nest_hooks[nesting_name]) {
      this.__sync_nest_hooks[nesting_name] = []
    }

    // TODO: subscribe to die event

    this.__sync_nest_hooks[nesting_name].push(fn)
  },
  __unhookNestSync: function(nesting_name, fn) {
    this.__sync_nest_hooks[nesting_name] = spv.arrayExclude(this.__sync_nest_hooks[nesting_name], fn)
  },

  simpleAppendNestingViews: function(declr, opts, nesname, array) {
    for (let bb = 0; bb < array.length; bb++) {
      let cur = array[bb]
      let original_md
      if (declr.is_wrapper_parent) {
        original_md = cur
        for (let i = 0; i < declr.is_wrapper_parent; i++) {
          cur = cur.getParentMapModel()
        }
      }


      this.appendFVAncorByVN({
        md: cur,
        original_md: original_md,
        by_model_name: declr.by_model_name,
        name: nesname,
        opts: (typeof opts == 'function' ? opts.call(this, cur, original_md) : opts),
        place: declr.place,
        space: declr.space,
        strict: declr.strict
      })
    }

  },
  coll_r_prio_prefix: 'coll-prio-',
  getRendOrderedNesting: function(nesname, array) {
    const getCollPriority = this[this.coll_r_prio_prefix + nesname]
    return getCollPriority && getCollPriority.call(this, array)
  },

  ___dkt_onAttrUpdate,
  ___dkt_saveInputFxTargetedResult,
})

export default View
