
import spv from '../spv'
import cloneObj from '../spv/cloneObj'
import CoreView from './CoreView'
import _updateAttrsByChanges from './_internal/_updateAttrsByChanges'
import PvTemplate from './pvTemplate/PvTemplate'
import appending from './View/appending'
import getBwlevView from './View/getBwlevView'
import createTemplate from './View/createTemplate'
import dom_helpers from './utils/dom_helpers'

const dFind = dom_helpers.find
const dAppend = dom_helpers.append
const dPrepend = dom_helpers.prepend
const dAfter = dom_helpers.after
const dDetach = dom_helpers.detach
const dWrap = dom_helpers.wrap
const dRemove = dom_helpers.remove
const dUnwrap = dom_helpers.unwrap
const dParent = dom_helpers.parent

const CH_GR_LE = 2

let way_points_counter = 0

const stackEmergency = function(fn, eventor, args) {
  return eventor._calls_flow.pushToFlow(fn, eventor, args)
}

const push = Array.prototype.push

const getBaseTreeSkeleton = function(array) {
  const result = new Array(array.length)
  for (let i = 0; i < array.length; i++) {
    result[i] = {
      handled: false,
      node: null,
      parent: array[i].parent && result[ array[i].parent.chunk_num ] || null,
      chunk_num: array[i].chunk_num
    }
  }
  return result
}


const props = {}
cloneObj(props, appending)
cloneObj(props, {
  createDetails: function() {
    if (this.pv_view_node) {
      this.useBase(this.pv_view_node)
    } else {
      if (this.base_skeleton) {
        this.checkExpandableTree()
        if (this.c) {
          this.useBase(this.c)
        }
        if (this.expandBase) {
          this.expandBase()
        }
      } else if (this.createBase) {
        this.createBase()
      }
    }

    if (!this.c) {
      return
    }

    this.useInterface('con', this.getCNode())

    this.c._provoda_view = this

    if (!this.c.length || !this.c[0]) {
      return
    }

    // legacy. when this.c is jquery wrapper
    for (let i = 0; i < this.c.length; i++) {
      this.c[i]._provoda_view = this
    }
  },

  useBase: function(node) {
    this.c = node
    this.createTemplate()
    if (this.bindBase) {
      this.bindBase()
    }
  },
  addWayPoint: function(point, opts) {
    const obj = {
      node: point,
      canUse: opts && opts.canUse,
      simple_check: opts && opts.simple_check,
      view: this,
      wpid: ++way_points_counter
    }
    if (!opts || (!opts.simple_check && !opts.canUse)) {
      //throw new Error('give me check tool!');
    }
    if (!this.way_points) {
      this.way_points = []
    }
    this.way_points.push(obj)
    return obj
  },
  hasWaypoint: function(point) {
    if (!this.way_points) {return}
    const arr = spv.filter(this.way_points, 'node')
    return arr.indexOf(point) != -1
  },
  removeWaypoint: function(point) {
    if (!this.way_points) {return}
    const stay = []
    for (let i = 0; i < this.way_points.length; i++) {
      const cur = this.way_points[i]
      if (cur.node != point) {
        stay.push(cur)
      } else {
        cur.removed = true
      }
    }
    this.way_points = stay
  },
  parseAppendedTPLPart: function(node) {
    this.tpl.parseAppended(node)
    this.tpl.ensureInitedWithStates(this._lbr.undetailed_states || this.states)

  },
  addTpl: function(tpl) {
    this.tpls = this.tpls || []
    this.tpls.push(tpl)
    tpl.ensureInitedWithStates(this._lbr.undetailed_states || this.states)
  },
  handleTemplateRPC: function(method) {
    if (arguments.length === 1) {
      const bwlev_view = getBwlevView(this)
      const bwlev_id = bwlev_view && bwlev_view.mpx._provoda_id
      this.RPCLegacy(method, bwlev_id)
    } else {
      this.RPCLegacy.apply(this, arguments)
    }
  },
  getTemplate: function(node, callCallbacks, pvTypesChange, pvTreeChange, anchorStateChange) {
    return this.root_view.pvtemplate(node, callCallbacks, pvTypesChange, false, pvTreeChange, anchorStateChange)
  },
  createTemplate: function(ext_node) {
    const con = ext_node || this.c
    if (!con) {
      throw new Error('cant create template')
    }

    const tpl = createTemplate(this, con)

    if (!ext_node) {
      this.tpl = tpl
    }

    tpl.root_node_raw._provoda_view = this

    return tpl
  },
  addTemplatedWaypoint: function(wp_wrap) {
    if (!this.hasWaypoint(wp_wrap.node)) {
      //может быть баг! fixme!?
      //не учитывается возможность при которой wp изменил свой mark
      //он должен быть удалён и добавлен заново с новыми параметрами
      let type
      if (wp_wrap.marks['hard-way-point']) {
        type = 'hard-way-point'
      } else if (wp_wrap.marks['way-point']) {
        type = 'way-point'
      }
      this.addWayPoint(wp_wrap.node, {
        canUse: function() {
          return !!(wp_wrap.marks && wp_wrap.marks[type])
        },
        simple_check: type == 'hard-way-point'
      })
    }
  },
  canUseWaypoints: function() {
    return true
  },
  canUseDeepWaypoints: function() {
    return true
  },
  getWaypoints: function(result_array) {
    if (!result_array) {
      throw new Error('you must apply result array')
    }
    if (this.canUseWaypoints()) {
      if (this.way_points) {
        push.apply(result_array, this.way_points)
      }

    }
    //return this.canUseWaypoints() ? this.way_points : [];
  },
  getAllWaypoints: function(result_array) {
    if (!result_array) {
      throw new Error('you must apply result array')
    }
    this.getWaypoints(result_array)
    this.getDeepWaypoints(result_array)

  },
  getDeepWaypoints: function(result_array) {
    if (!result_array) {
      throw new Error('you must apply result array')
    }
    if (this.canUseWaypoints() && this.canUseDeepWaypoints()) {
      //var views = this.getDeepChildren(exept);
      for (let i = 0; i < this.children.length; i++) {
        const cur = this.children[i]
        cur.getAllWaypoints(result_array)
      }
    }

  },
  updateTemplatedWaypoints: function(add, remove) {
    if (!this.isAlive()) {
      return
    }
    let i = 0
    if (remove) {
      const nodes_to_remove = spv.filter(remove, 'node')
      for (i = 0; i < nodes_to_remove.length; i++) {
        this.removeWaypoint(nodes_to_remove[i])
      }
    }
    for (i = 0; i < add.length; i++) {
      this.addTemplatedWaypoint(add[i])
    }
    if (add.length) {
      //console.log(add);
    }
  },
  recalcTotalStatesList: function(states) {
    this.__total_states_list.length = 0

    this.__total_states_list.length = this._attrs_collector.all.length * CH_GR_LE

    for (let i = 0; i < this._attrs_collector.all.length; i++) {
      const state_name = this._attrs_collector.all[i]
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
    let i = 0
    //var states = this.states;
    if (this.tpl) {
      this.tpl.checkChanges(total_ch, this.states, !sync_tpl, !sync_tpl && this.current_motivator)
    }
    if (this.tpls) {
      for (i = 0; i < this.tpls.length; i++) {
        this.tpls[i].checkChanges(total_ch, this.states, !sync_tpl, !sync_tpl && this.current_motivator)
      }
    }

  },
  getT: function() {
    return this.c || this.pv_view_node || dWrap(this.getA())
  },
  getC: function() {
    return this.c
  },
  getA: function() {
    return this._lbr._anchor || (this._lbr._anchor = window.document.createComment(''))

    //document.createTextNode('')
  },
  getCNode: function() {
    return dUnwrap(this.getC())
  },
  unwrapNode: dUnwrap,
  isAlive: function(dead_doc) {
    if (this.dead) {
      return false
    } else {
      if (this.getC()) {
        const c = this.getCNode()
        if (!c || (dead_doc && dead_doc === c.ownerDocument) || !spv.getDefaultView(c.ownerDocument)) {
          this.markAsDead()
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    }
  },
  remove: function(con, anchor) {
    if (!con) {
      con = this.getC()
    }
    if (con) {
      dRemove(con)
    }
    if (!anchor) {
      anchor = this._lbr._anchor
    }
    if (anchor) {
      dRemove(anchor)
    }

  },
  domDie: function() {
    dRemove(this.getC())
  },
  markDomDead: function() {
    stackEmergency(this.remove, this, [this.getC(), this._lbr._anchor])


    // TODO: check that nextTick will be executed when global window is dead
    // and setTimeout/requestAnimationFrame won't work
    this.useInterface('con', null)
    if (this.c) {
      this.c._provoda_view = null

      // legacy. when this.c is jquery wrapper
      for (let i = 0; i < this.c.length; i++) {
        this.c[i]._provoda_view = null
      }
    }


    this.c = null

    if (this.base_skeleton) {
      for (let i = 0; i < this.base_skeleton.length; i++) {
        dWrap(this.base_skeleton[i].node) // remove?
      }
      this.base_skeleton = null
    }


    this._lbr._anchor = null
    if (this.tpl) {
      this.tpl.root_node_raw._provoda_view = null
      this.tpl.destroy()
      this.tpl = null
    }

    if (this.tpls) {
      for (let i = 0; i < this.tpls.length; i++) {
        this.tpls[i].root_node_raw._provoda_view = null
        this.tpls[i].destroy()
      }
      this.tpls = null
    }
    this.way_points = null

    if (this.wp_box) {
      this.wp_box = null
    }
    if (this.pv_view_node) {
      this.pv_view_node = null
    }



    if (this.dom_related_props) {
      for (let i = 0; i < this.dom_related_props.length; i++) {
        this[this.dom_related_props[i]] = null
      }
    }
  },
  appendCon: function() {
    if (this.skip_anchor_appending) {
      return
    }
    const con = this.getC()
    const anchor = this._lbr._anchor
    if (con && anchor && anchor.parentNode) {
      dAfter(anchor, con)
      //anchor.parentNode.insertBefore(con[0], anchor.nextSibling);
      this._lbr._anchor = null
      dDetach(anchor)
      _updateAttrsByChanges(this, [
        'vis_con_appended', true,
        '$meta$apis$con$appended', true
      ])
    } else if (con && dUnwrap(dParent(con))) {
      _updateAttrsByChanges(this, [
        'vis_con_appended', true,
        '$meta$apis$con$appended', true
      ])

    }
  },
  checkExpandableTree: function() {
    let i
    let cur
    let cur_config
    let has_changes = true
    const append_list = []
    while (this.base_skeleton && has_changes) {
      has_changes = false
      for (i = 0; i < this.base_skeleton.length; i++) {
        cur = this.base_skeleton[i]
        cur_config = this.base_tree_list[ cur.chunk_num ]
        if (cur.handled) {
          continue
        }
        if (!cur.parent || cur.parent.handled) {
          if (!cur_config.needs_expand_state) {
            cur.handled = true
            if (cur_config.sample_name) {
              cur.node = this.root_view.getSample(cur_config.sample_name)
            } else if (cur_config.part_name) {
              cur.node = this.requirePart(cur_config.part_name)
            } else {
              throw new Error('how to get node for this?!')
            }
            has_changes = true
            append_list.push(cur)

            //sample_name
            //part_name
          }
        }

        //chunk_num
      }
      while (append_list.length) {
        cur = append_list.pop()
        if (cur.parent && cur.parent.node) {
          cur_config = this.base_tree_list[ cur.chunk_num ]
          const target_node = cur_config.selector
            ? dFind(cur.parent.node, cur_config.selector)
            : dWrap(cur.parent.node)

          if (!cur_config.prepend) {
            dAppend(target_node, cur.node)
          } else {
            dPrepend(target_node, cur.node)
          }

          if (cur_config.needs_expand_state && cur_config.parse_as_tplpart) {
            this.parseAppendedTPLPart(cur.node)
          }
        } else if (cur.parent) {
          console.log('cant append')
        } else {
          this.c = cur.node
        }
      }

    }
    if (!this.c && this.base_skeleton[0].node) {
      this.c = this.base_skeleton[0].node
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
    const old_mt = this.current_motivator
    this.current_motivator = current_motivator

    this.ensureTotalChangesUpdates()
    const total_ch = this.__total_states_list
    this.updateTemplatesStates(total_ch)

    const children_models = this.mpx.__getRels()
    for (const nesname in children_models) {
      this.pvCollectionChange(nesname, children_models[nesname])
    }

    this.current_motivator = old_mt
  },
})
const DomView = spv.inh(CoreView, {
  init: function initDomView(target) {
    if (target.base_tree_list) {
      target.base_skeleton = getBaseTreeSkeleton(target.base_tree_list)
    }
  }
}, cloneObj(props, {
  DOMView: function() {
    return DomView
  },
}))
DomView._PvTemplate = PvTemplate

export default DomView
