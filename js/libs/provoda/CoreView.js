define(function(require) {
'use strict';

// var $ = require('cash-dom');
var spv = require('spv');
var _updateAttr = require('_updateAttr');
var groupMotive = require('./helpers/groupMotive')
var triggerDestroy = require('./helpers/triggerDestroy')
var updateProxy = require('./updateProxy');
var prsStCon =  require('./prsStCon');
var StatesEmitter = require('./StatesEmitter');
var onPropsExtend = require('./View/onExtend');

var selectCollectionChange = require('./View/selectCollectionChange');

var initApis = require('./dcl/effects/legacy/api/init')
var initInputAttrs = require('./dcl/attrs/input/init')
var nestBorrowInit = require('./dcl_view/nest_borrow/init');
var nestBorrowDestroy = require('./dcl_view/nest_borrow/destroy');
var nestBorrowCheckChange = require('./dcl_view/nest_borrow/check-change');

var initSpyglasses = require('./dcl_view/spyglass/init');
var getBwlevView = require('./dcl_view/getBwlevView');
var getViewLocationId = require('./View/getViewLocationId')

var makeAttrsCollector = require('./View/makeAttrsCollector')
var CH_GR_LE = 2


// var spyglassDestroy = require('./dcl_view/spyglass/destroy');

var cloneObj = spv.cloneObj;

var ViewLabour = function() {
  this.has_details = null;
  this._detailed = null;
  this.dettree_incomplete = null;
  this.detltree_depth = null;
  this._states_set_processing = null;
  this._collections_set_processing = null;
  this.innesting_pos_current = null;
  this.innest_prev_view = null;
  this.innest_next_view = null;

  this.demensions_key_start = null;

  this._anchor = null;
  //this.innesting_pos_old = null;

  this.detached = null;

  this.hndTriggerTPLevents = null;
  this.hndPvTypeChange = null;
  this.hndPvTreeChange = null;

  this.marked_as_dead = null;


  this.undetailed_states = {};
  this.undetailed_children_models = {};
  this.__sync_hooks = null;
  this.__sync_nest_hooks = null;
};

var initView = function(target, view_otps, opts){

  target.used_data_structure = view_otps.used_data_structure || target.used_data_structure;

  target.req_order_field = null;
  target.tpl = null;
  target.c = null;

  target.dead = null;
  target.pv_view_node = null;
  target.dclrs_fpckgs = target.dclrs_fpckgs;
  // target.dclrs_selectors = null;
  target.base_skeleton = null;

  target.nesting_space = view_otps.nesting_space;
  target.nesting_name = view_otps.nesting_name;
  target.by_model_name = Boolean(view_otps.by_model_name);

  target.parent_view = null;
  if (view_otps.parent_view){
    target.parent_view = view_otps.parent_view;
  }
  target.root_view = null;
  if (view_otps.root_view){
    target.root_view = view_otps.root_view;
  }

  target._highway = view_otps._highway || target.parent_view._highway || target.root_view._highway;
  target.view_id = target._highway.views_counter++;
  target._calls_flow = target._highway.calls_flow;
  target._local_calls_flow = target._highway.local_calls_flow;

  target.opts = null;
  if (opts){
    target.opts = opts;
  }

  target.children = [];
  target.children_models = {};

  if (target.parent_view && !view_otps.location_name){
    throw new Error('give me location name!');
    //используется для идентификации использования одной и тойже view внутри разнородных родительских view или разных пространств внутри одного view
  }
  target.location_name = view_otps.location_name;
  if (!view_otps.mpx){
    throw new Error('give me model!');
  }

  target.mpx = view_otps.mpx;
  target.proxies_space = (target.parent_view && target.parent_view.proxies_space) || view_otps.proxies_space || null;

  makeAttrsCollector(target)

  target.way_points = null;

  target.dom_related_props = null;
  if (target.dom_rp){
    target.dom_related_props = [];
  }
  target._lbr = new ViewLabour();

  target.mpx._assignPublicAttrs(target._lbr.undetailed_states)
  cloneObj(target._lbr.undetailed_states, target.mpx.vstates);
  var default_attrs = initInputAttrs(target)
  if (default_attrs) {
    cloneObj(target._lbr.undetailed_states, default_attrs)
  }

  cloneObj(target._lbr.undetailed_children_models, target.mpx.nestings);

  prsStCon.connect.parent(target, target);
  prsStCon.connect.root(target, target);

  nestBorrowInit(target);
  initSpyglasses(target)

  if (target.__connectAdapter) {
    target.__connectAdapter.call(null, target)
  }

  initApis(target, opts && opts.interfaces)

};


var getSpyglassData = function(current_view, target_id, probe_name, value, req) {
  var parent_bwlev_view = getBwlevView(current_view);

  var data = {
    context_md: parent_bwlev_view && parent_bwlev_view.children_models.pioneer._provoda_id,
    bwlev: parent_bwlev_view && parent_bwlev_view.mpx.md._provoda_id,
    target_id: target_id,
    probe_name: probe_name,
    value: value,
    req: req,
    probe_container_uri: null,
  };

  return data
}

var changeSpyglassUniversal = function (method) {
  return function (e, node, probe_name, value, req) {
    var data = getSpyglassData(this, this.mpx._provoda_id, probe_name, value, req)

    var bwlev_view = this.root_view.parent_view;
    bwlev_view.RPCLegacy(method, data);
  }
}

var changeSpyglassUniversalM = function(method) {
  return function (probe_name, target_id, value, req) {
    var data = getSpyglassData(this, target_id, probe_name, value, req)

    var bwlev_view = this.root_view.parent_view;
    bwlev_view.RPCLegacy(method, data);
  }
}

var selectParent = function (view) {
  return view.parent_view
}

var getStrucParent = function(item, _count) {
  var count = _count || 1

  var target = item;
  while (count){
    count--;
    target = selectParent(target);

    if (!target) {
      throw new Error('no parent for step ' + count)
    }
  }
  return target
}

var emptyFakeList = {length:0}

var View = spv.inh(StatesEmitter, {
  naming: function(fn) {
    return function View(view_otps, opts) {
      fn(this, view_otps, opts);
    };
  },
  init: initView,
  onExtend: onPropsExtend
}, {
  ___attrsToSync: function() {
    if (this._lbr.undetailed_states) {
      return this._lbr.undetailed_states
    }

    return this.states;
  },
  requestPageById: function(_provoda_id) {
    this.root_view.parent_view.RPCLegacy('requestPage', _provoda_id);
  },
  requestPage: function() {
    var md_id = this.mpx._provoda_id;

    this.root_view.parent_view.RPCLegacy('requestPage', md_id);
  },
  navShowByReq: function(reqId, goal, options, data) {
    var router_name = options && options.router
    var remember_context = !options || options.remember_context !== false

    var bwlev_view = getBwlevView(this);

    var context_bwlev = remember_context
      ? (bwlev_view && bwlev_view.mpx._provoda_id)
      : null
    var current_bwlev_map = remember_context
      ? (bwlev_view && bwlev_view.mpx.md.children_models.map.children_models.current_mp_bwlev._provoda_id)
      : null;

    this.root_view.parent_view.RPCLegacy('navShowByReq', {
      id: reqId,
      goal: goal,
      data: data,
      remember_context: remember_context,
      context_bwlev: context_bwlev,
      current_bwlev_map: current_bwlev_map,
    }, router_name);
  },
  navCheckGoalToGetBack: function(goal) {
    var bwlev_view = getBwlevView(this)
    bwlev_view.RPCLegacy('navCheckGoalToGetBack', goal)
  },
  navGetBack: function() {
    var bwlev_view = getBwlevView(this)
    bwlev_view.RPCLegacy('navGetBack')
  },
  tpl_events: {
    updateState: function(e, node, state_name, value) {
      this.updateState(state_name, value);
    },
    updateAttr: function(e, node, state_name, value) {
      this.updateAttr(state_name, value);
    },
    requestPage: function() {
      this.requestPage();
    },
    requestPageById: function(e, node, _provoda_id) {
      this.requestPageById(_provoda_id);
    },
    requestNavParent: function(e, node, value) {
      // it's legacy. avoid using it

      var num = Math.max(1, value ? parseInt(value, 10) : 1);
      var parent = this.mpx.md.map_parent;
      var back = num;
      while (back > 1) {
        parent = parent.map_parent
        back--
      }

      this.requestPageById(parent._provoda_id);
    },
    followTo: function() {
      var md_id = this.mpx._provoda_id;
      var bwlev_view = getBwlevView(this);
      this.root_view.parent_view.RPCLegacy('followTo', bwlev_view.mpx._provoda_id, md_id);
    },
    followURL: function(e, node, url) {
      var bwlev_view = getBwlevView(this);
      this.root_view.parent_view.RPCLegacy('followURL', bwlev_view.mpx._provoda_id, url);
    },
    toggleSpyglass: changeSpyglassUniversal('toggleSpyglass'),
    updateSpyglass: changeSpyglassUniversal('updateSpyglass'),
  },
  updateSpyglass: changeSpyglassUniversalM('updateSpyglass'),
  toggleSpyglass: changeSpyglassUniversalM('toggleSpyglass'),
  getSpyglassData: getSpyglassData,
  onExtend: spv.precall(StatesEmitter.prototype.onExtend, function (md, props, original, params) {
    return onPropsExtend(md, props, original, params);
  }),
  getStrucRoot: function() {
    return this.root_view;
  },
  getStrucParent: function(count) {
    return getStrucParent(this, count)
  },
  getInstanceKey: function() {
    return this.view_id
  },
  getNesting: function(collection_name) {
    return this.children_models[collection_name];
  },
  demensions_cache: {},
  checkDemensionsKeyStart: function() {
    if (!this._lbr.demensions_key_start){
      var arr = [];
      var cur = this;
      while (cur.parent_view) {
        arr.push(cur.location_name);

        cur = cur.parent_view;
      }
      arr.reverse();
      this._lbr.demensions_key_start = arr.join(' ');

      //this._lbr.demensions_key_start = this.location_name + '-' + (this.parent_view && this.parent_view.location_name + '-');
    }
  },
  getBoxDemensionKey: function() {
    var args = new Array(arguments.length); //optimization
    for (var i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];

    }
    this.checkDemensionsKeyStart();
    return this._lbr.demensions_key_start.concat(args.join('-'));

  },
  getBoxDemensionByKey: function(cb, key) {
    if (typeof this.demensions_cache[key] == 'undefined'){
      this.demensions_cache[key] = cb.call(this);
    }
    return this.demensions_cache[key];
  },
  getBoxDemension: function(cb) {
    var args = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++) {
      args[i-1] = arguments[i];
    }


    var key = this.getBoxDemensionKey.apply(this, args);
    return this.getBoxDemensionByKey(cb, key);
  },
  getReqsOrderField: function() {
    if (!this.req_order_field){
      this.req_order_field = ['mdata', 'v', this.view_id, 'order'];
    }
    return this.req_order_field;
  },
  getStoredMpx: function(md) {
    if (md.stream) {
      return md.mpx;
    } else {
      // getModel
      var space = this.proxies_space || this.root_view.proxies_space;
      return this._highway.views_proxies.getMPX(space, md);
    }
    //

  },
  RPCLegacy: function() {
    this.mpx.RPCLegacy.apply(this.mpx, arguments);
  },
  children_views: {},
  connectChildrenModels: groupMotive(function() {
    var udchm = this._lbr.undetailed_children_models;
    this._lbr.undetailed_children_models = null;
    this.setMdChildren(udchm);

  }),
  connectStates: function() {
    var states = this._lbr.undetailed_states;
    this._lbr.undetailed_states = null;
    this._setStates(states);

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
    if (!this._lbr.has_details){
      this._lbr.has_details = true;
      this.createDetails();
    }
  },
  requestDetailes: function(){
    this.requestDetailesCreating();
    this._lbr._detailed = true;
    if (!this.manual_states_connect){
      this.connectChildrenModels();
      this.connectStates();
    }
    this.appendCon();
  },

  getFreeCV: function(child_name, view_space, opts) {
    var md = this.getMdChild(child_name);
    if (md){
      var view = this.getFreeChildView({
        by_model_name: false,
        nesting_name: child_name,
        nesting_space: view_space
      }, md, opts);
      return view;
    } else {
      throw new Error('there is no ' + child_name + ' child model');
    }
  },
  getAFreeCV: function(child_name, view_space, opts) {
    var view = this.getFreeCV(child_name, view_space, opts);
    if (view){
      var anchor = view.getA();
      if (anchor){
        return anchor;
      } else {
        throw new Error('there is no anchor for view of ' + child_name + ' child model');
      }
    }

  },
  getFreeChildView: function(address_opts, md, opts) {
    var mpx = this.getStoredMpx(md);
    var
      child_name = address_opts.nesting_name,
      view_space = address_opts.nesting_space || 'main',
      location_id = getViewLocationId(this, address_opts.nesting_name, view_space),
      view = mpx.getView(location_id);

    if (view){
      return false;
    } else {

      var ConstrObj;
      var controller_name = address_opts.controller_name;
      if (controller_name) {
        ConstrObj = this.root_view.controllers && this.root_view.controllers[controller_name];
        if (!ConstrObj) {
          throw new Error('controller `' + controller_name +
            '` should be defined in root_view.controllers');
        }
      } else if (address_opts.by_model_name) {

        ConstrObj = this.children_views_by_mn &&
          (this.children_views_by_mn[address_opts.nesting_name][md.model_name] ||
          this.children_views_by_mn[address_opts.nesting_name]['$default']);

      } else {
        ConstrObj = this.children_views[address_opts.nesting_name];
      }


      var Constr;
      if (typeof ConstrObj == 'function' && view_space == 'main'){
        Constr = ConstrObj;
      } else if (ConstrObj) {
        Constr = ConstrObj[view_space];
      }
      if (!Constr && address_opts.sampleController){
        Constr = address_opts.sampleController;
      }
      if (!Constr) {
        throw new Error('there is no View for ' + address_opts.nesting_name);
      }

      var used_data_structure;

      if (this.used_data_structure) {

        var field_path = address_opts.by_model_name ? ['children_by_mn', child_name, md.model_name, view_space] : ['children', child_name, view_space];
        //$default must be used too
        var sub_tree = this.used_data_structure.constr_children && spv.getTargetField(this.used_data_structure.constr_children, field_path);

        if (!sub_tree) {
          sub_tree = this.used_data_structure.tree_children && spv.getTargetField(this.used_data_structure.tree_children, field_path);
        }
        if (!sub_tree) {
          //debugger;
        }

        used_data_structure = sub_tree;
      }

      var view_otps = {
        mpx: mpx,
        parent_view: this,
        root_view: this.root_view,
        location_name: child_name + '-' + view_space,
        nesting_space: view_space,
        nesting_name: child_name,
        by_model_name: address_opts.by_model_name,
        used_data_structure: used_data_structure
      };

      view = new Constr(view_otps, opts);
      if (view.init) {
        view.init(view_otps, opts);
      }

      mpx.addView(view, location_id);
      this.addChildView(view, child_name);
      return view;
    }
  },
  getRelativeRequestsGroups: function(space) {
    var all_views = [];
    var all_requests = [];
    var iterating = [this];
    var i = 0, cur = null;
    while (iterating.length){
      cur = iterating.shift();
      for (i = 0; i < cur.children.length; i++) {
        iterating.push(cur.children[i]);
        all_views.push(cur.children[i]);
      }
    }

    for (i = 0; i < all_views.length; i++) {
      var reqs = all_views[i].getModelImmediateRequests(space);
      if (reqs && reqs.length){
        all_requests.push(reqs);
      }
    }
    return all_requests;
  },
  addChildView: function(view) {
    this.children.push.call(this.children, view);
    //fixme - possible memory leak when child is dead (this.children)
  },
  getChildViewsByMpx: function(mpx, nesting_name) {
    var result = [];
    var views = mpx.getViews();
    var i = 0;
    for (i = 0; i < this.children.length; i++) {
      var cur = this.children[i];
      if (views.indexOf(cur) != -1 && (!nesting_name || (cur.nesting_name == nesting_name))){
        result.push(cur);
      }

    }
    return result;
  },
  removeChildViewsByMd: function(mpx, nesting_name) {
    var views_to_remove = this.getChildViewsByMpx(mpx, nesting_name);
    var i = 0;
    for (i = 0; i < views_to_remove.length; i++) {
      views_to_remove[i].die();
    }
    this.children = spv.arrayExclude(this.children, views_to_remove);

  },
  getDeepChildren: function(exept) {
    var all = [];
    var big_tree = [];
    exept = spv.toRealArray(exept);

    big_tree.push(this);
    //var cursor = this;
    while (big_tree.length){
      var cursor = big_tree.shift();

      for (var i = 0; i < cursor.children.length; i++) {
        var cur = cursor.children[i];
        if (all.indexOf(cur) == -1 && exept.indexOf(cur) == -1){
          big_tree.push(cur);
          all.push(cur);
        }
      }

    }
    return all;
  },

  checkDeadChildren: function() {
    var i = 0, alive = [];
    for (i = 0; i < this.children.length; i++) {
      if (this.children[i].dead){
        //dead.push(this.children[i]);
      } else {
        alive.push(this.children[i]);
      }
    }
    if (alive.length != this.children.length){
      this.children = alive;
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

    var i = 0;
    if (!this.parent_view && this.proxies_space) {
      this._highway.views_proxies.removeSpaceById(this.proxies_space);
    }
    this.dead = true; //new DeathMarker();
    this.stopRequests();

    triggerDestroy(this);
    if (!skip_md_call){
      this.mpx.removeDeadViews();
    }

    this.markDomDead()

    var children = this.children;
    this.children = emptyFakeList;
    for (i = 0; i < children.length; i++) {
      children[i].markAsDead();
    }
    //debugger?


  },
  domDie: function() {

  },
  markDomDead: function() {

  },
  die: function(opts){
    if (this._lbr.marked_as_dead){
      return this
    }

    prsStCon.disconnect.parent(this, this);
    prsStCon.disconnect.root(this, this);


    this.domDie()
    this.markAsDead(opts && opts.skip_md_call);
    nestBorrowDestroy(this);
    this._lbr.marked_as_dead = true;
    // spyglassDestroy(this)

    return this
  },
  requestView: function() {
    this.requestAll();
  },
  requestAll: groupMotive(function(){
    return this.requestDeepDetLevels();
  }),
  __tickDetRequest: function() {
    if (!this.isAlive()){
      return;
    }
    this._lbr.dettree_incomplete = this.requestDetalizationLevel(this._lbr.detltree_depth);
    this._lbr.detltree_depth++;
    if (this._lbr.dettree_incomplete){
      this.nextLocalTick(this.__tickDetRequest);
    }
  },
  requestDeepDetLevels: function(){
    if (!this.current_motivator) {
      // throw new Error('should be current_motivator');
    }
    if (this._lbr._states_set_processing || this._lbr._collections_set_processing){
      return this;
    }
    //iterate TREE
    this._lbr.detltree_depth = 1;
    this._lbr.dettree_incomplete = true;



    this.nextLocalTick(this.__tickDetRequest);

    return this;
  },
  softRequestChildrenDetLev: function(rel_depth) {
    if (this._lbr._states_set_processing || this._lbr._collections_set_processing){
      return this;
    }
    this.requestChildrenDetLev(rel_depth);
  },
  requestChildrenDetLev: function(rel_depth){
    var incomplete = false;
    if (this.children.length && rel_depth === 0){
      return true;
    } else {
      for (var i = 0; i < this.children.length; i++) {
        var cur = this.children[i];
        cur.current_motivator = this.current_motivator;
        var cur_incomplete = cur.requestDetalizationLevel(rel_depth);
        cur.current_motivator = null;
        incomplete = incomplete || cur_incomplete;
      }
      return incomplete;
    }
  },
  requestDetalizationLevel: function(rel_depth){
    if (!this._lbr._detailed){
      this.requestDetailes();
    }
    return this.requestChildrenDetLev(rel_depth - 1);
  },
  isAliveFast: function() {
    return !this.dead;
  },
  isAlive: function() {
    return this.isAliveFast()
  },
  _setStates: groupMotive(function(states){
    this._lbr._states_set_processing = true;
    //disallow chilren request untill all states will be setted

    this.states = this._attrs_collector.makeAttrsValues();
    //var _this = this;


    //var complex_states = [];


    var states_list = [];

    for (var name in states){
      states_list.push(name, states[name]);
    }

    this._updateProxy(states_list);
    this._lbr._states_set_processing = null;
    return this;
  }),
  stackReceivedChanges: (function() {
    return function() {
      if (!this.isAlive()){
        return;
      }

      var args = new Array(arguments.length);
      for (var i = 0; i < arguments.length; i++) {
        args[i] = arguments[i];
      }
      args.unshift(this);

      this.nextTick(updateProxy, args);

      if (this.__syncStates) {
        this.nextTick(this.__syncStates, args);
      }
    };
  })(),
  __hookStateSync: function(fn) {
    if (!this.__sync_hooks) {
      this.__sync_hooks = []
    }

    // TODO: subscribe to die event

    this.__sync_hooks.push(fn);
  },
  __unhookStateSync: function(fn) {
    this.__sync_hooks = spv.arrayExclude(this.__sync_hooks, fn);
  },
  __changesToObject: function (changes_list) {
    var result = {}
    for (var i = 0; i < changes_list.length; i += CH_GR_LE) {
      result[changes_list[i]] = changes_list[i + 1]
      result = result
    }

    return result
  },
  __handleHookedSync: function(self, changes, all) {
    if (!self.__sync_hooks) {
      return
    }

    for (var i = 0; i < self.__sync_hooks.length; i++) {
      self.__sync_hooks[i].call(null, self, changes, all)
    }
  },
  receiveStatesChanges: groupMotive(function(changes_list, opts) {
    if (!this.isAlive()){
      return;
    }
    updateProxy(this, changes_list, opts);
  }),
  promiseStateUpdate: function(name, value) {
    updateProxy(this, [name, value]);
  },
  checkChildrenModelsRendering: function() {
    var obj = cloneObj(false, this.children_models);
    this.setMdChildren(obj);
  },
  setMdChildren: function(collections) {
    this._lbr._collections_set_processing = true;
    //вью только что создана, присоединяем подчинённые views без деталей (детали создаются позже)
    for (var i in collections) {
      this.collectionChange(this, i, collections[i]);
    }
    this._lbr._collections_set_processing = null;
  },
  getMdChild: function(name) {
    return this.children_models[name];
  },
  pvserv: {
    simple: {

    },
    bymodel: {

    }
  },
  appendFVAncorByVN: function(opts) {
    var view = this.getFreeChildView({
      by_model_name: opts.by_model_name,
      nesting_name: opts.name,
      nesting_space: opts.space
    }, opts.md, opts.opts);

  },
  stackCollectionChange: function() {
    var args = new Array(arguments.length);
    for (var i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    args.unshift(this);

    this.nextTick(this.collectionChange, args);
  },
  collectionChange: function(target, nesname, items, rold_value, removed) {
    if (!target.isAlive()){
      return;
    }
    if (target._lbr.undetailed_children_models){
      target._lbr.undetailed_children_models[nesname] = items;
      return target;
    }

    var old_value = target.children_models[nesname];
    target.children_models[nesname] = items;

    selectCollectionChange(target, nesname, items, removed, old_value);

    target.checkDeadChildren();
    nestBorrowCheckChange(target, nesname, items, rold_value, removed);
    return target;
  },
  removeViewsByMds: function(array, nesname, space) {
    if (!array){
      return;
    }
    var location_id = getViewLocationId(this, nesname, space || 'main');
    for (var i = 0; i < array.length; i++) {

      var view = this.getStoredMpx(array[i]).getView(location_id);
      if (view){
        view.die();
      } else {
        //throw 'wrong';
      }
    }
  },
  callCollectionChangeDeclaration: function(dclr_fpckg, nesname, array, old_value, removed) {
    if (typeof dclr_fpckg == 'function'){
      dclr_fpckg.call(this, nesname, array, old_value, removed);
    } else {

      var real_array = spv.toRealArray(array);
      var array_limit;
      if (dclr_fpckg.limit){
        array_limit = Math.min(dclr_fpckg.limit, real_array.length);
      } else {
        array_limit = real_array.length;
      }
      var min_array = real_array.slice(0, array_limit);
      var declr = dclr_fpckg;
      if (typeof declr.place == 'string'){
        var place = spv.getTargetField(this, declr.place);
        if (!place){
          throw new Error('wrong place declaration: "' + declr.place + '"');
        }
      }
      var opts = declr.opts;
      this.removeViewsByMds(removed, nesname, declr.space);
      if (typeof declr.place == 'function' || !declr.place){
        this.simpleAppendNestingViews(declr, opts, nesname, min_array);
        if (!dclr_fpckg.not_request){
          this.requestAll();
        }
      } else {
        this.appendNestingViews(declr, opts, nesname, min_array, dclr_fpckg.not_request);
      }
    }
    this.__injecViewMetaStates.call(null, this, nesname, dclr_fpckg.space, array)

    this.__handleHookedNestSync.call(null, this, nesname, dclr_fpckg.space, array);

  },

  __injecViewMetaStates: function(self, nesting_name, space, items) {

    var location_id = getViewLocationId(self, nesting_name, 'main');
    var array = spv.toRealArray(items);


    var real_length = 0
    for (var i = 0; i < array.length; i++) {
      var cur = array[i];
      if (cur.$not_model) {
        continue;
      }
      var view = self.getStoredMpx(cur).getView(location_id);
      if (!view) {
        continue;
      }

      real_length++;


    }

    var counter = 0
    for (var i = 0; i < array.length; i++) {
      var cur = array[i];
      if (cur.$not_model) {
        continue;
      }
      var view = self.getStoredMpx(cur).getView(location_id);
      if (!view) {
        continue;
      }

      var $first = counter == 0;
      var $back = (real_length - 1) - counter
      var $last = $back == 0;

      // Should it be with as input, not internal state change?
      _updateAttr(view, '$index', counter);
      _updateAttr(view, '$index_back', $back);
      _updateAttr(view, '$first', $first);
      _updateAttr(view, '$last', $last);
      _updateAttr(view, '$middle', !($first || $last));

      counter++;
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

    var views = self.__mapListToViews(nesting_name, items)

    for (var i = 0; i < self.__sync_nest_hooks[nesting_name].length; i++) {
      self.__sync_nest_hooks[nesting_name][i].call(null, views)
    }
  },
  __mapListToViews: function(nesting_name, items) {
    var self = this
    var location_id = getViewLocationId(this, nesting_name, 'main');
    var array = spv.toRealArray(items);
    var views = array
      .map(function(cur) {
        return self.getStoredMpx(cur).getView(location_id);
      })
      .filter(Boolean)

    return views;
  },
  __viewsList: function(nesting_name) {
    return this.__mapListToViews(nesting_name, this.children_models[nesting_name])
  },
  __hookNestSync: function(nesting_name, fn) {
    if (!this.__sync_nest_hooks) {
      this.__sync_nest_hooks = {}
    }
    if (!this.__sync_nest_hooks[nesting_name]) {
      this.__sync_nest_hooks[nesting_name] = []
    }

    // TODO: subscribe to die event

    this.__sync_nest_hooks[nesting_name].push(fn);
  },
  __unhookNestSync: function(nesting_name, fn) {
    this.__sync_nest_hooks[nesting_name] = spv.arrayExclude(this.__sync_nest_hooks[nesting_name], fn);
  },

  simpleAppendNestingViews: function(declr, opts, nesname, array) {
    for (var bb = 0; bb < array.length; bb++) {
      var cur = array[bb];
      var original_md;
      if (declr.is_wrapper_parent) {
        original_md = cur;
        for (var i = 0; i < declr.is_wrapper_parent; i++) {
          cur = cur.getParentMapModel();
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
      });
    }

  },
  coll_r_prio_prefix: 'coll-prio-',
  getRendOrderedNesting: function(nesname, array) {
    var getCollPriority = this[this.coll_r_prio_prefix + nesname];
    return getCollPriority && getCollPriority.call(this, array);
  },
});

return View;
});
