
import css from './css'
import getAttr from '../../libs/provoda/provoda/getAttr'
import getModelFromR from '../../libs/provoda/provoda/v/getModelFromR'
import getBwlevContentFromR from './getBwlevContentFromR'
import anyDeeplyIncludedViews from './anyDeeplyIncludedViews'
import dom_helpers from '../../libs/provoda/utils/dom_helpers'
import getLevByBwlev from './getLevelContainer'
import { isZoomingOnly } from '../../libs/provoda/bwlev/probeDiff'

// var findMpxViewInChildren = require('./findMpxViewInChildren')

const can_animate = css.transform && css.transition
const css_transform = css.transform
const transform_props = css_transform ? [css_transform] : []

const getNavOHeight = function() {
  if (!this.root_view.els?.navs) {
    return 0
  }
  return this.root_view.els.navs.outerHeight()
}
const getAMCWidth = function() {
  return dom_helpers.width(this.getInterface('app_map_con'))
}
const getAMCOffset = function() {
  return dom_helpers.offset(this.getInterface('app_map_con'))
}

const assertAttr = (root_view, attr_name) => {
  const value = root_view.getAttr(attr_name)
  if (value == null) {
    throw new Error('root view should have ' + attr_name + ' attr')
  }
  return value
}

const findAnyViewToZoom = (view, diff, prev_bwlev_r) => {
  /* would be nice to find exact last model of zoom-in. but let's use nav parents too */

  const lastChanges = diff[diff.length - 1]

  for (let i = lastChanges.changes.length - 1; i >= 0; i--) {
    const cur = lastChanges.changes[i]
    const bwlev = getModelFromR(view, cur.bwlev)
    const best_matched_view = view.getMapSliceImmediateChildView(bwlev, getBwlevContentFromR(view, bwlev))

    const target_in_parent = best_matched_view || anyDeeplyIncludedViews(view, prev_bwlev_r, bwlev)
    if (target_in_parent) {
      return target_in_parent
    }
  }

  return null
}


export default function readMapSliceAnimationData(view, diff, current_bwlev_r, prev_bwlev_r) {
  if (!current_bwlev_r) {return}

  const bwlev = getModelFromR(view, current_bwlev_r)

  const current_lev_num = getAttr(bwlev, 'map_level_num')
  const is_zooming_only = isZoomingOnly(diff)
  if (!(can_animate && current_lev_num != -1 && is_zooming_only)) {return}
  const target_in_parent = findAnyViewToZoom(view, diff, prev_bwlev_r)
  if (!target_in_parent) {return}

  const targt_con = target_in_parent.getC()

  const disable_zoom_cache = view.disable_zoom_cache

  // var offset_parent_node = targt_con.offsetParent();
  const parent_offset = disable_zoom_cache
    ? getAMCOffset.call(view)
    : view.getBoxDemension(getAMCOffset, 'screens_offset')
  // или ни о чего не зависит или зависит от позиции скрола, если шапка не скролится

  // var offset = targt_con.offset(); //domread
  const targetOffset = function() {
    // works only for best_matched_view
    return targt_con.offset()
  }
  const offset = disable_zoom_cache
    ? targetOffset()
    : target_in_parent.getBoxDemension(targetOffset, 'con_offset', target_in_parent._lbr.innesting_pos_current, view.root_view.getAttr('window_height'), view.root_view.getAttr('workarea_width'))

  const getWidth = function() {
    return targt_con.outerWidth()
  }
  const width = disable_zoom_cache
    ? getWidth()
    : target_in_parent.getBoxDemension(getWidth, 'con_width', assertAttr(view.root_view, 'window_height'), assertAttr(view.root_view, 'workarea_width'))

  const getHeight = function() {
    return targt_con.outerHeight()
  }
  const height = disable_zoom_cache
    ? getHeight()
    : target_in_parent.getBoxDemension(getHeight, 'con_height', assertAttr(view.root_view, 'window_height'), assertAttr(view.root_view, 'workarea_width'))


  // var width = targt_con.outerWidth();  //domread
  // var height = targt_con.outerHeight(); //domread

  const top = offset.top - parent_offset.top
  const left = offset.left - parent_offset.left

  const con_height_part = disable_zoom_cache
    ? getNavOHeight.call(view)
    : view.getBoxDemension(getNavOHeight, 'navs_height')
  const con_height = assertAttr(view.root_view, 'window_height') - con_height_part //domread, can_be_cached

  const con_width = disable_zoom_cache
    ? getAMCWidth.call(view)
    : view.getBoxDemension(getAMCWidth, 'screens_width', assertAttr(view.root_view, 'workarea_width'))

  const scale_x = width / con_width
  const scale_y = height / con_height
  const min_scale = Math.min(scale_x, scale_y)

  const shift_x = width / 2 - min_scale * con_width / 2
  const shift_y = height / 2 - min_scale * con_height / 2

  const lc = getLevByBwlev(view, bwlev)

  const transform_values = {}
  const value = 'translate(' + (left + shift_x) + 'px, ' + (top + shift_y) + 'px)  scale(' + min_scale + ')'
  transform_props.forEach(function(el) {
    transform_values[el] = value
  })

  // from small size (size of button) to size of viewport

  // --
  // function getMapSliceChildInParenViewOLD(md) {
  //   var parent_md = md.map_parent;
  //
  //
  //   var parent_view = this.getMapSliceView(parent_md);
  //   if (!parent_view){
  //     return;
  //   }
  //   var target_in_parent = findMpxViewInChildren(parent_view, this.getStoredMpx(md));
  //   if (!target_in_parent){
  //     var view = parent_view.getChildViewsByMpx(this.getStoredMpx(md));
  //     target_in_parent = view && view[0];
  //   }
  //   return target_in_parent;
  // };


  return {
    lc: lc,
    transform_values: transform_values
  }
}
