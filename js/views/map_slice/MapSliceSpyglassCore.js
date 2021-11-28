
import View from '../../libs/provoda/View'
import spv from '../../libs/spv'

import updateAttr from '../../libs/provoda/provoda/updateAttr'
import _updateAttr from '../../libs/provoda/_internal/_updateAttr'
import mpxUpdateAttr from '../../libs/provoda/provoda/v/mpxUpdateAttr'
import selecPoineertDeclr from '../../libs/provoda/provoda/v/selecPoineertDeclr'
import createTemplate from '../../libs/provoda/provoda/v/createTemplate'
import probeDiff, { isOneStepZoomIn } from '../../libs/provoda/bwlev/probeDiff'
import getNesting from '../../libs/provoda/provoda/getNesting'
import $ from 'cash-dom'
import wrapInputCall from '../../libs/provoda/provoda/wrapInputCall'
import getModelFromR from '../../libs/provoda/provoda/v/getModelFromR'
import readMapSliceAnimationData from './readMapSliceAnimationData'
import animateMapSlice, { getLevNum } from './animateMapSlice'
import findMpxViewInChildren from './findMpxViewInChildren'
import handleNavChange from './handleNavChange'
import getLevByBwlev from './getLevelContainer'
import getBwlevContainer from './getBwlevContainer'

const last = (list) => list && list[list.length - 1]



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
  'collch-current_mp_md': function(_name, value) {
    _updateAttr(this, 'current_mp_md', value._provoda_id)
  },
  'collch-current_mp_bwlev': function(_name, value) {
    _updateAttr(this, 'current_mp_bwlev', value._provoda_id)
  },
  'collch-navigation': {
    place: 'nav.daddy'
  },

  'stch-full_page_need': function(target, state) {
    target.root_view.els.screens.toggleClass('full_page_need', !!state)
  },
  handleSearchForm: function(form_node) {
    const tpl = this.createTemplate(form_node)
    this.tpls.push(tpl)
  },
  buildNavHelper: function() {
    this.tpls.push(createTemplate(
      this, this.root_view.els.nav_helper
    ))
  },
  buildNowPlayingButton: function() {
    const _this = this
    const np_button = this.nav.justhead.find('.np-button').detach()
    _this.tpls.push(createTemplate(this, np_button))
    this.nav.daddy.append(np_button)
  },
  'stch-nav_helper_is_needed': function(target, state) {
    if (!state) {
      updateAttr(target, 'nav_helper_full', false)
    }
  },

  buildNav: function() {
    const justhead = this.root_view.els.navs
    const daddy = justhead.find('.daddy')

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
  wrapStartScreen: function(start_screen_node) {
    const start_screen = $(start_screen_node)
    const st_scr_scrl_con = start_screen.parent()
    const start_page_wrap = st_scr_scrl_con.parent()

    const tpl = this.parent_view.pvtemplate(start_page_wrap, false, false, {
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

  'collch-$spec_common-map_slice': {
    place: function(bwlev, view) {
      return getBwlevContainer(this, bwlev, view)
    }
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
    let target_md
    let i
    for (i = 0; i < array.length; i++) {
      if (this.getStoredMpx(array[i]).__getAttr('mp_has_focus')) {
        target_md = array[i]
        break
      }
    }
    return target_md
  },

  'collch-map_slice': function(nesname, next_tree, prev_tree) {
    const diff = probeDiff(next_tree, prev_tree || [])

    const array = this.getRendOrderedNesting(nesname, next_tree) || next_tree

    const animation_data = readMapSliceAnimationData(
      this,
      isOneStepZoomIn(diff.array),
      last(next_tree),
      last(prev_tree)
    )

    for (let i = array.length - 1; i >= 0; i--) {
      const cur = getModelFromR(this, array[i])
      const cur_md = cur.getNesting('pioneer')

      const dclr = selecPoineertDeclr(
        this.dclrs_fpckgs,
        this.dclrs_selectors,
        nesname, cur_md.model_name,
        this.nesting_space
      )

      this.callCollectionChangeDeclaration(dclr, nesname, cur)
    }

    //avoid nextTick method!
    if (this.completely_rendered_once['map_slice']) {
      animateMapSlice(this, diff.bwlev, diff.array, animation_data)
      return
    }

    const current_lev_num = getLevNum(this, diff.bwlev)

    const models = new Array(array.length)
    for (let i = 0; i < array.length; i++) {
      models[i] = getModelFromR(this, array[i])
    }

    this.markAnimationStart(models, -1)

    for (let i = 0; i < diff.array.length; i++) {
      const cur_batch = diff.array[i]
      for (let jj = 0; jj < cur_batch.changes.length; jj++) {
        handleNavChange(this, cur_batch.changes[jj])
      }
    }

    _updateAttr(this, 'current_lev_num', current_lev_num)
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

    const bwlev = target.getNesting('current_mp_bwlev')
    const parent_bwlev = bwlev.getParentMapModel()
    const md = target.getNesting('current_mp_md')


    const scrollTop = function(wNode, value) {
      const node = wNode.get(0)
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
      const mplev_item_view = target.getMapSliceImmediateChildView(bwlev.getParentMapModel(), md)
      const con = mplev_item_view && mplev_item_view.getC()
      if (con && con.height()) {
        target.root_view.scrollTo(mplev_item_view.getC(), {
          node: getLevByBwlev(target, parent_bwlev).scroll_con
        }, {vp_limit: 0.4, animate: 117})
      } else {
        scrollTop(getLevByBwlev(target, parent_bwlev).scroll_con, 0)
      }
    }, 150)

  },
  getMapSliceView: function(bwlev, md) {
    const dclr = selecPoineertDeclr(this.dclrs_fpckgs, this.dclrs_selectors,
      'map_slice', md.model_name, this.nesting_space)
    const target_bwlev = dclr.is_wrapper_parent ? bwlev.getParentMapModel() : bwlev
    return findMpxViewInChildren(this, this.getStoredMpx(target_bwlev), dclr.space, 'map_slice')
  },

  getMapSliceImmediateChildView: function(bwlev) {
    // md of parent view could differ from md.map_parent
    const md = getNesting(bwlev, 'pioneer')

    const bwlev_view = this.getMapSliceView(bwlev, md)
    const view = bwlev_view && findMpxViewInChildren(bwlev_view, this.getStoredMpx(md))
    if (!view) {
      return
    }
    let target_in_parent = findMpxViewInChildren(view, this.getStoredMpx(md))
    if (!target_in_parent) {
      const view_in_view = view.getChildViewsByMpx(this.getStoredMpx(md))
      target_in_parent = view_in_view && view_in_view[0]
    }
    return target_in_parent
  },
  markAnimationStart: function(models, changes_number) {
    _updateAttr(this, 'map_animation_num_started', changes_number)
    for (let i = 0; i < models.length; i++) {
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


    for (let i = 0; i < models.length; i++) {
      //
      const mpx = this.getStoredMpx(getModelFromR(this, models[i]))

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
