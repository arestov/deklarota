
import View from '../../libs/provoda/View'
import spv from '../../libs/spv'
import css from './css'
import pvState from '../../libs/provoda/provoda/state'
import updateAttr from '../../libs/provoda/provoda/updateAttr'
import _updateAttr from '../../libs/provoda/_internal/_updateAttr'
import mpxUpdateAttr from '../../libs/provoda/provoda/v/mpxUpdateAttr'
import selecPoineertDeclr from '../../libs/provoda/provoda/v/selecPoineertDeclr'
import createTemplate from '../../libs/provoda/provoda/v/createTemplate'
import probeDiff from '../../libs/provoda/provoda/probeDiff'
import getNesting from '../../libs/provoda/provoda/getNesting'
import $ from 'cash-dom'
import wrapInputCall from '../../libs/provoda/provoda/wrapInputCall'
import getModelFromR from '../../libs/provoda/provoda/v/getModelFromR'
import readMapSliceAnimationData from './readMapSliceAnimationData'
import animateMapSlice from './animateMapSlice'
import findMpxViewInChildren from './findMpxViewInChildren'

var can_animate = css.transform && css.transition

var LevContainer = function(con, scroll_con, material, tpl, context) {
  this.c = con
  this.scroll_con = scroll_con
  this.material = material
  this.tpl = tpl
  this.context = context
  this.callbacks = []
  var _this = this
  if (can_animate) {
    spv.addEvent(this.c[0], can_animate, function() {
      //console.log(e);
      _this.completeAnimation()
    })
  }
}

var viewOnLevelP = function(md, view) {
  var lev_conj = this.getLevelContainer(md, view.nesting_space == 'detailed')
  view.wayp_scan_stop = true
  return lev_conj.material
}

LevContainer.prototype = {
  onTransitionEnd: function(cb) {
    this.callbacks.push(cb)
  },
  completeAnimation: function() {
    while (this.callbacks.length) {
      var cb = this.callbacks.shift()
      this.context.nextLocalTick(cb)
    }
  }
}


export default spv.inh(View, {
  init: function(self) {
    self.parent_view.general_navigation_view = self
  },
}, {
  dom_rp: true,
  // 'nest_borrow-search_criteria': [
  //   '^^search_criteria',
  //   SearchCriteriaView
  // ],
  tpl_events: {
    showFullNavHelper: function() {
      updateAttr(this, 'nav_helper_full', true)
    },
  },
  'collch-current_mp_md': function(name, value) {
    _updateAttr(this, 'current_mp_md', value._provoda_id)
  },
  'collch-current_mp_bwlev': function(name, value) {
    _updateAttr(this, 'current_mp_bwlev', value._provoda_id)
  },
  'collch-navigation': {
    place: 'nav.daddy'
  },

  'stch-full_page_need': function(target, state) {
    target.root_view.els.screens.toggleClass('full_page_need', !!state)
  },
  handleSearchForm: function(form_node) {
    var tpl = this.createTemplate(form_node)
    this.tpls.push(tpl)
  },
  buildNavHelper: function() {
    this.tpls.push(createTemplate(
      this, this.root_view.els.nav_helper
    ))
  },
  buildNowPlayingButton: function() {
    var _this = this
    var np_button = this.nav.justhead.find('.np-button').detach()
    _this.tpls.push(createTemplate(this, np_button))
    this.nav.daddy.append(np_button)
  },
  'stch-nav_helper_is_needed': function(target, state) {
    if (!state) {
      updateAttr(target, 'nav_helper_full', false)
    }
  },

  buildNav: function() {
    var justhead = this.root_view.els.navs
    var daddy = justhead.find('.daddy')

    this.nav = {
      justhead: justhead,
      daddy: daddy
    }
    this.dom_related_props.push('nav')

    this.nav.daddy.empty().removeClass('not-inited')

    return this.nav
  },
  sendOnInit: function() {
    // var ext_search_query = this.els.search_input.val();
    //must be before start_page view set its value to search_input
    this.RPCLegacy('checkUserInput', {
      // ext_search_query: ext_search_query
    })

    this.onDie(function() {
      this.RPCLegacy('detachUI', this.root_view.root_view_uid)
    })

    this.RPCLegacy('attachUI', this.root_view.root_view_uid)
  },
  createDetails() {
    this._super()

    this.input(() => {
      // since manual_states_connect
      this.connectStates()
    })
  },
  manual_states_connect: true,
  effects: {
    api: {
      base: [
        ['_provoda_id'],
        ['self', 'start_screen_node'],
        (self, start_screen_node) => {
          self.tpls = self.tpls || []

          self.lev_containers = {}
          self.max_level_num = -1
          self.dom_related_props.push('lev_containers')
          self.completely_rendered_once = {}
          self.wrapStartScreen(start_screen_node)
          self.buildNav()
          self.handleSearchForm()
          self.buildNowPlayingButton()
          self.buildNavHelper()

          self.sendOnInit()

          self.input(() => {
            // since manual_states_connect
            self.connectChildrenModels()
            self.requestView()
          })
        }
      ]
    }
  },
  getLevByBwlev: function(bwlev, deeper) {
    return this.getLevelContainer(bwlev, deeper)

  },
  getLevelContainer: function(bwlev, deeper) {
    var raw_num = bwlev.states.map_level_num
    if (raw_num < -1) {
      return
    }

    var real_num = bwlev.getNesting('pioneer').map_level_num
    var num = raw_num + (deeper ? 1 : 0)
    if (num == -1 && real_num == -1) {
      return this.lev_containers.start_page
    }

    var num = raw_num
    if (this.lev_containers[num]) {
      return this.lev_containers[num]
    } else {
      /*
      if (!view){
        throw new Error('give me "view"');
      }*/
      if (num == -1 && !this.lev_containers.start_page) {
        throw new Error('start_screen must exist')
      }

      var node = this.root_view.getSample('complex-page')

      var tpl = this.parent_view.pvtemplate(node, false, false, {
        '$lev_num': num
      })

      this.addTpl(tpl)

      var next_lev_con
      for (var i = num; i <= this.max_level_num; i++) {
        if (this.lev_containers[i]) {
          next_lev_con = this.lev_containers[i]
          break
        }
      }
      if (next_lev_con) {
        node.insertBefore(next_lev_con.c)
      } else {
        node.appendTo(this.getInterface('app_map_con'))
      }

      var lev_con = new LevContainer
          (node,
          tpl.ancs['scroll_con'],
          tpl.ancs['material'],
          tpl,
          this)
      this.lev_containers[num] = lev_con

      this.max_level_num = Math.max(this.max_level_num, num)
      return lev_con
    }
  },
  wrapStartScreen: function(start_screen_node) {
    const start_screen = $(start_screen_node)
    var st_scr_scrl_con = start_screen.parent()
    var start_page_wrap = st_scr_scrl_con.parent()

    var tpl = this.parent_view.pvtemplate(start_page_wrap, false, false, {
      '$lev_num': -1
    })


    this.tpls.push(tpl)

    this.lev_containers['start_page'] = {
      c: start_page_wrap,
      material: start_screen,
      scroll_con: st_scr_scrl_con
    }
  },
  setVMpshow: function(target_mpx, value) {
    mpxUpdateAttr(target_mpx, 'vmp_show', value)
  },

  'model-mapch': {
    'move-view': function(change) {
      var parent = getModelFromR(this, change.bwlev).getParentMapModel()
      if (parent) {
      //	_updateAttr(parent, 'mp_has_focus', false);
      }
      this.setVMpshow(this.getStoredMpx(getModelFromR(this, change.bwlev)), change.value)
    },
    'zoom-out': function(change) {
      this.setVMpshow(this.getStoredMpx(getModelFromR(this, change.bwlev)), false)
    },
    'destroy': function(change) {
      var md = getModelFromR(this, change.bwlev)
      this.setVMpshow(this.getStoredMpx(md), false)
    }
  },

  'collch-$spec_common-map_slice': {
    place: viewOnLevelP
  },

  'sel-coll-map_slice': '$spec_common-map_slice',

  'coll-prio-map_slice': function(array) {

    /*for (var i = 0; i < array.length; i++) {
      if (array[i].mpx.states.mp_has_focus){
        return [[array[i]]];
      }
    }*/
    return array

  },

  findBMapTarget: function(array) {
    var target_md, i
    for (i = 0; i < array.length; i++) {
      if (this.getStoredMpx(array[i]).__getAttr('mp_has_focus')) {
        target_md = array[i]
        break
      }
    }
    return target_md
  },

  'collch-map_slice': function(nesname, nesting_data, old_nesting_data) {
    var mp_show_states = nesting_data.residents_struc.mp_show_states
    var transaction = nesting_data.transaction

    if (!transaction) {
      throw new Error('map_slice should have `transaction`')
    }

    if (!transaction.bwlev) {
      throw new Error('map_slice transaction should have `bwlev`')
    }

    var old_transaction = old_nesting_data && old_nesting_data.transaction

    var diff = probeDiff(this, transaction.bwlev, old_transaction && old_transaction.bwlev)

    var bwlevs = nesting_data.residents_struc && nesting_data.residents_struc.bwlevs
    var mds = nesting_data.residents_struc.items
    var target_md


    var array = this.getRendOrderedNesting(nesname, bwlevs) || bwlevs
    var i, cur

    var animation_data = readMapSliceAnimationData(this, diff)

    for (i = array.length - 1; i >= 0; i--) {
      var cur_md = getModelFromR(this, mds[i])
      cur = getModelFromR(this, array[i])

      var dclr = selecPoineertDeclr(this.dclrs_fpckgs, this.dclrs_selectors,
              nesname, cur_md.model_name, this.nesting_space)

      this.callCollectionChangeDeclaration(dclr, nesname, cur)
    }

    //avoid nextTick method!
    if (this.completely_rendered_once['map_slice']) {
      animateMapSlice(this, transaction, animation_data)
      if (!transaction.bwlev) {
        target_md = this.findBMapTarget(array)
        if (target_md) {
          _updateAttr(this, 'current_lev_num', pvState(target_md, 'map_level_num'))
        }

      }
      return
    }

    var models = new Array(array.length)
    for (i = 0; i < array.length; i++) {
      models[i] = getModelFromR(this, array[i])
    }
    target_md = this.findBMapTarget(models)
    if (!target_md) {
      throw new Error('there is no model with focus!')
    }
    this.markAnimationStart(models, -1)
    for (i = 0; i < models.length; i++) {
      this.setVMpshow(this.getStoredMpx(models[i]), mp_show_states[i])
    }
    _updateAttr(this, 'current_lev_num', pvState(target_md, 'map_level_num'))
    this.markAnimationEnd(models, -1)
    this.completely_rendered_once['map_slice'] = true
  },
  'stch-doc_title': function(target, title) {
    target.parent_view.d.title = title || ''
  },
  'stch-current_mp_bwlev': function(target) {

    //map_level_num
    //md.map_level_num

    /*
    var highlight = md.state('mp-highlight');
    if (highlight && highlight.source_md){
      var source_md = highlight.source_md;

      var md_view = findMpxViewInChildren(target, md.mpx);
      if (md_view){
        var hl_view = findMpxViewInChildren(md_view, source_md.mpx);
        if (hl_view){
          //target.scrollTo(hl_view.getC());
        }
      }
    }*/
    /*

    var ov_md = md.getParentMapModel();
    var ov_highlight = ov_md && ov_md.state('mp-highlight');
    if (ov_highlight && ov_highlight.source_md){
      var source_md = ov_highlight.source_md;
      var mplev_item_view = getRooConPresentation(source_md, target); // use getMapSliceImmediateChildView ?
      if (mplev_item_view){
        target.scrollTo(mplev_item_view.getC(), {
          node: target.getLevByNum(md.map_level_num - 1).scroll_con
        }, {vp_limit: 0.4, animate: 117});
      }


    }*/

    var bwlev = target.getNesting('current_mp_bwlev')
    var parent_bwlev = bwlev.getParentMapModel()
    var md = target.getNesting('current_mp_md')


    var scrollTop = function(wNode, value) {
      var node = wNode.get(0)
      if (value == null) {
        return node.scrollTop
      }

      node.scrollTop = value
    }

    setTimeout(function() {
      if (!target.isAlive()) {
        target = null
        return
      }

      //

      if (!parent_bwlev) {
        return
      }

      // var mplev_item_view = getRooConPresentation(target.getStoredMpx(md), target, false, false, true); // use getMapSliceImmediateChildView ?
      var mplev_item_view = target.getMapSliceImmediateChildView(bwlev.getParentMapModel(), md)
      var con = mplev_item_view && mplev_item_view.getC()
      if (con && con.height()) {
        target.root_view.scrollTo(mplev_item_view.getC(), {
          node: target.getLevByBwlev(parent_bwlev).scroll_con
        }, {vp_limit: 0.4, animate: 117})
      } else {
        scrollTop(target.getLevByBwlev(parent_bwlev).scroll_con, 0)
      }
    }, 150)

  },
  getMapSliceView: function(bwlev, md) {
    var dclr = selecPoineertDeclr(this.dclrs_fpckgs, this.dclrs_selectors,
      'map_slice', md.model_name, this.nesting_space)
    var target_bwlev = dclr.is_wrapper_parent ? bwlev.map_parent : bwlev
    return findMpxViewInChildren(this, this.getStoredMpx(target_bwlev), dclr.space, 'map_slice')
  },

  getMapSliceImmediateChildView: function(bwlev, md) {
    // md of parent view could differ from md.map_parent
    var md = getNesting(bwlev, 'pioneer')

    var bwlev_view = this.getMapSliceView(bwlev, md)
    var view = bwlev_view && findMpxViewInChildren(bwlev_view, this.getStoredMpx(md))
    if (!view) {
      return
    }
    var target_in_parent = findMpxViewInChildren(view, this.getStoredMpx(md))
    if (!target_in_parent) {
      var view = view.getChildViewsByMpx(this.getStoredMpx(md))
      target_in_parent = view && view[0]
    }
    return target_in_parent
  },
  markAnimationStart: function(models, changes_number) {
    _updateAttr(this, 'map_animation_num_started', changes_number)
    for (var i = 0; i < models.length; i++) {
      mpxUpdateAttr(this.getStoredMpx(getModelFromR(this, models[i])), 'animation_started', changes_number)
      ////MUST UPDATE VIEW, NOT MODEL!!!!!
    }
  },

  markAnimationEnd: wrapInputCall(function(models, changes_number) {
    if (!this.isAlive()) {
      return
    }

    if (this.state('map_animation_num_started') == changes_number) {
      _updateAttr(this, 'map_animation_num_completed', changes_number)
    }


    for (var i = 0; i < models.length; i++) {
      //
      var mpx = this.getStoredMpx(getModelFromR(this, models[i]))

      if (mpx.state('animation_started') == changes_number) {
        mpxUpdateAttr(mpx, 'animation_completed', changes_number)
      }
      ////MUST UPDATE VIEW, NOT MODEL!!!!!
    }
  }),
  attrs: {
    'map_animating': [
      'comp',
      ['map_animation_num_started', 'map_animation_num_completed'],
      function(started_num, completed_num) {
        return typeof started_num == 'number' && started_num != completed_num
      }
    ]
  },
})
