define(function(require) {
'use strict';
var spv = require('spv');
var CoreView = require('./CoreView')
var _updateAttr = require('_updateAttr');
var PvTemplate = require('./pvTemplate/PvTemplate');
var appending = require('./View/appending')
var getBwlevView = require('./View/getBwlevView')
var createTemplate = require('./View/createTemplate')
var dom_helpers = require('./utils/dom_helpers')

var dFind = dom_helpers.find;
var dAppend = dom_helpers.append;
var dPrepend = dom_helpers.prepend;
var dAfter = dom_helpers.after;
var dDetach = dom_helpers.detach;
var dWrap = dom_helpers.wrap;
var dRemove = dom_helpers.remove;
var dUnwrap = dom_helpers.unwrap;
var dParent = dom_helpers.parent;

var CH_GR_LE = 2

var way_points_counter = 0;

var stackEmergency = function(fn, eventor, args) {
  return eventor._calls_flow.pushToFlow(fn, eventor, args);
};

var push = Array.prototype.push;

var getBaseTreeSkeleton = function(array) {
  var result = new Array(array.length);
  for (var i = 0; i < array.length; i++) {
    result[i] = {
      handled: false,
      node: null,
      parent: array[i].parent && result[ array[i].parent.chunk_num ] || null,
      chunk_num: array[i].chunk_num
    };
  }
  return result;
};


var DomView
var props = {}
spv.cloneObj(props, appending)
spv.cloneObj(props, {
  DOMView: function() {
    return DomView
  },
  createDetails: function() {
    if (this.pv_view_node){
      this.useBase(this.pv_view_node);
    } else {
      if (this.base_skeleton) {
        this.checkExpandableTree();
        if (this.c) {
          this.useBase(this.c);
        }
        if (this.expandBase) {
          this.expandBase();
        }
      } else if (this.createBase){
        this.createBase();
      }
    }

    if (!this.c) {
      return
    }

    this.useInterface('con', this.getCNode())

    this.c._provoda_view = this;

    if (!this.c.length || !this.c[0]) {
      return
    }

    // legacy. when this.c is jquery wrapper
    for (var i = 0; i < this.c.length; i++) {
      this.c[i]._provoda_view = this;
    }
  },

  useBase: function(node) {
    this.c = node;
    this.createTemplate();
    if (this.bindBase){
      this.bindBase();
    }
  },
  addWayPoint: function(point, opts) {
    var obj = {
      node: point,
      canUse: opts && opts.canUse,
      simple_check: opts && opts.simple_check,
      view: this,
      wpid: ++way_points_counter
    };
    if (!opts || (!opts.simple_check && !opts.canUse)){
      //throw new Error('give me check tool!');
    }
    if (!this.way_points) {
      this.way_points = [];
    }
    this.way_points.push(obj);
    return obj;
  },
  hasWaypoint: function(point) {
    if (!this.way_points) {return;}
    var arr = spv.filter(this.way_points, 'node');
    return arr.indexOf(point) != -1;
  },
  removeWaypoint: function(point) {
    if (!this.way_points) {return;}
    var stay = [];
    for (var i = 0; i < this.way_points.length; i++) {
      var cur = this.way_points[i];
      if (cur.node != point){
        stay.push(cur);
      } else {
        cur.removed = true;
      }
    }
    this.way_points = stay;
  },
  parseAppendedTPLPart: function(node) {
    this.tpl.parseAppended(node);
    this.tpl.setStates(this._lbr.undetailed_states || this.states);
  },
  handleTemplateRPC: function(method) {
    if (arguments.length === 1) {
      var bwlev_view = getBwlevView(this);
      var bwlev_id = bwlev_view && bwlev_view.mpx._provoda_id;
      this.RPCLegacy(method, bwlev_id);
    } else {
      this.RPCLegacy.apply(this, arguments);
    }
  },
  getTemplate: function(node, callCallbacks, pvTypesChange, pvTreeChange, anchorStateChange) {
    return this.root_view.pvtemplate(node, callCallbacks, pvTypesChange, false, pvTreeChange, anchorStateChange);
  },
  createTemplate: function(ext_node) {
    var con = ext_node || this.c;
    if (!con){
      throw new Error('cant create template');
    }

    var tpl = createTemplate(this, con);

    if (!ext_node) {
      this.tpl = tpl;
    }

    tpl.root_node_raw._provoda_view = this;

    return tpl;
  },
  addTemplatedWaypoint: function(wp_wrap) {
    if (!this.hasWaypoint(wp_wrap.node)){
      //может быть баг! fixme!?
      //не учитывается возможность при которой wp изменил свой mark
      //он должен быть удалён и добавлен заново с новыми параметрами
      var type;
      if (wp_wrap.marks['hard-way-point']){
        type = 'hard-way-point';
      } else if (wp_wrap.marks['way-point']){
        type = 'way-point';
      }
      this.addWayPoint(wp_wrap.node, {
        canUse: function() {
          return !!(wp_wrap.marks && wp_wrap.marks[type]);
        },
        simple_check: type == 'hard-way-point'
      });
    }
  },
  canUseWaypoints: function() {
    return true;
  },
  canUseDeepWaypoints: function() {
    return true;
  },
  getWaypoints: function(result_array) {
    if (!result_array) {
      throw new Error('you must apply result array');
    }
    if (this.canUseWaypoints()) {
      if (this.way_points) {
        push.apply(result_array, this.way_points);
      }

    }
    //return this.canUseWaypoints() ? this.way_points : [];
  },
  getAllWaypoints: function(result_array) {
    if (!result_array) {
      throw new Error('you must apply result array');
    }
    this.getWaypoints(result_array);
    this.getDeepWaypoints(result_array);

  },
  getDeepWaypoints: function(result_array) {
    if (!result_array) {
      throw new Error('you must apply result array');
    }
    if (this.canUseWaypoints() && this.canUseDeepWaypoints()){
      //var views = this.getDeepChildren(exept);
      for (var i = 0; i < this.children.length; i++) {
        var cur = this.children[i];
        cur.getAllWaypoints(result_array);
      }
    }

  },
  updateTemplatedWaypoints: function(add, remove) {
    if (!this.isAlive()) {
      return;
    }
    var i = 0;
    if (remove){
      var nodes_to_remove = spv.filter(remove, 'node');
      for (i = 0; i < nodes_to_remove.length; i++) {
        this.removeWaypoint(nodes_to_remove[i]);
      }
    }
    for (i = 0; i < add.length; i++) {
      this.addTemplatedWaypoint(add[i]);
    }
    if (add.length){
      //console.log(add);
    }
  },
  recalcTotalStatesList: function(states) {
    this.__total_states_list.length = 0

    this.__total_states_list.length = this._attrs_collector.all.length * CH_GR_LE

    for (var i = 0; i < this._attrs_collector.all.length; i++) {
      var state_name = this._attrs_collector.all[i]
      this.__total_states_list[i * CH_GR_LE] = state_name
      this.__total_states_list[i * CH_GR_LE + 1] = states[state_name]
    }
  },
  ensureTotalChangesUpdates: function() {
    if (this.__total_states_list) {
      return
    }

    this.__total_states_list = []
    this.recalcTotalStatesList(this.states)
  },
  keepTotalChangesUpdates: function(states) {
    if (!this.__total_states_list) {
      return
    }
    this.recalcTotalStatesList(states)

  },
  updateTemplatesStates: function(total_ch, sync_tpl) {
    var i = 0;
    //var states = this.states;
    if (this.tpl){
      this.tpl.checkChanges(total_ch, this.states, !sync_tpl, !sync_tpl && this.current_motivator);
    }
    if (this.tpls){
      for (i = 0; i < this.tpls.length; i++) {
        this.tpls[i].checkChanges(total_ch, this.states, !sync_tpl, !sync_tpl && this.current_motivator);
      }
    }

  },
  getT: function(){
    return this.c || this.pv_view_node || dWrap(this.getA());
  },
  getC: function(){
    return this.c;
  },
  getA: function(){
    return this._lbr._anchor || (this._lbr._anchor = window.document.createComment(''));

    //document.createTextNode('')
  },
  getWindow: function() {
    return spv.getDefaultView(this.d || dUnwrap(this.getC()).ownerDocument);
  },
  getCNode: function() {
    return dUnwrap(this.getC());
  },
  isAlive: function(dead_doc) {
    if (this.dead){
      return false;
    } else {
      if (this.getC()){
        var c = this.getCNode();
        if (!c || (dead_doc && dead_doc === c.ownerDocument) || !spv.getDefaultView(c.ownerDocument)){
          this.markAsDead();
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    }
  },
  remove: function(con, anchor) {
    if (!con){
      con = this.getC();
    }
    if (con){
      dRemove(con);
    }
    if (!anchor){
      anchor = this._lbr._anchor;
    }
    if (anchor){
      dRemove(anchor)
    }

  },
  domDie: function() {
    dRemove(this.getC())
  },
  markDomDead: function() {
    stackEmergency(this.remove, this, [this.getC(), this._lbr._anchor]);


    // TODO: check that nextTick will be executed when global window is dead
    // and setTimeout/requestAnimationFrame won't work
    this.useInterface('con', null)
    if (this.c) {
      this.c._provoda_view = null;

      // legacy. when this.c is jquery wrapper
      for (var i = 0; i < this.c.length; i++) {
        this.c[i]._provoda_view = null;
      }
    }


    this.c = null;

    if (this.base_skeleton) {
      for (var i = 0; i < this.base_skeleton.length; i++) {
        dWrap(this.base_skeleton[i].node) // remove?
      }
      this.base_skeleton = null;
    }


    this._lbr._anchor = null;
    if (this.tpl) {
      this.tpl.root_node_raw._provoda_view = null
      this.tpl.destroy();
      this.tpl = null;
    }

    if (this.tpls){
      for (var i = 0; i < this.tpls.length; i++) {
        this.tpls[i].root_node_raw._provoda_view = null
        this.tpls[i].destroy();
      }
      this.tpls = null;
    }
    this.way_points = null;

    if (this.wp_box){
      this.wp_box = null;
    }
    if (this.pv_view_node){
      this.pv_view_node = null;
    }



    if (this.dom_related_props){
      for (i = 0; i < this.dom_related_props.length; i++) {
        this[this.dom_related_props[i]] = null;
      }
    }
  },
  appendCon: function(){
    if (this.skip_anchor_appending){
      return;
    }
    var con = this.getC();
    var anchor = this._lbr._anchor;
    if (con && anchor && anchor.parentNode){
      dAfter(anchor, con);
      //anchor.parentNode.insertBefore(con[0], anchor.nextSibling);
      this._lbr._anchor = null;
      dDetach(anchor);
      _updateAttr(this, 'vis_con_appended', true);
      _updateAttr(this, '$meta$apis$con$appended', true)

    } else if (con && dUnwrap(dParent(con))){
      _updateAttr(this, 'vis_con_appended', true);
      _updateAttr(this, '$meta$apis$con$appended', true)

    }
  },
  checkExpandableTree: function() {
    var i, cur, cur_config, has_changes = true, append_list = [];
    while (this.base_skeleton && has_changes) {
      has_changes = false;
      for (i = 0; i < this.base_skeleton.length; i++) {
        cur = this.base_skeleton[i];
        cur_config = this.base_tree_list[ cur.chunk_num ];
        if (cur.handled) {
          continue;
        }
        if (!cur.parent || cur.parent.handled) {
          if (!cur_config.needs_expand_state){
            cur.handled = true;
            if (cur_config.sample_name) {
              cur.node = this.root_view.getSample( cur_config.sample_name );
            } else if (cur_config.part_name) {
              cur.node = this.requirePart( cur_config.part_name );
            } else {
              throw new Error('how to get node for this?!');
            }
            has_changes = true;
            append_list.push(cur);

            //sample_name
            //part_name
          }
        }

        //chunk_num
      }
      while (append_list.length) {
        cur = append_list.pop();
        if (cur.parent && cur.parent.node) {
          cur_config = this.base_tree_list[ cur.chunk_num ];
          var target_node = cur_config.selector
            ? dFind(cur.parent.node, cur_config.selector)
            : dWrap(cur.parent.node);

          if (!cur_config.prepend) {
            dAppend(target_node, cur.node)
          } else {
            dPrepend(target_node, cur.node)
          }

          if (cur_config.needs_expand_state && cur_config.parse_as_tplpart) {
            this.parseAppendedTPLPart(cur.node);
          }
        } else if (cur.parent){
          console.log('cant append');
        } else {
          this.c = cur.node;
        }
      }

    }
    if (!this.c && this.base_skeleton[0].node) {
      this.c = this.base_skeleton[0].node;
    }

    //если есть прикреплённый родитель и пришло время прикреплять (если оно должно было прийти)
    //

    /*
    прикрепление родителя
    парсинг детей
    прикрепление детей

    прикрепление детей привязаных к якорю



    */

  },

  checkTplTreeChange: function(current_motivator) {
    var old_mt = this.current_motivator;
    this.current_motivator = current_motivator;

    this.ensureTotalChangesUpdates()
    var total_ch = this.__total_states_list
    this.updateTemplatesStates(total_ch);

    for (var nesname in this.children_models) {

      this.pvCollectionChange(nesname, this.children_models[nesname]);
    }

    this.current_motivator = old_mt;
  },
})
DomView = spv.inh(CoreView, {
  init: function initDomView(target) {
    if (target.base_tree_list) {
      target.base_skeleton = getBaseTreeSkeleton(target.base_tree_list);
    }
  }
}, props)
DomView._PvTemplate = PvTemplate;

return DomView

})
