
import spv from '../../libs/spv'
import css from './css'
import getModelFromR from '../../libs/provoda/provoda/v/getModelFromR'
import _updateAttr from '../../libs/provoda/_internal/_updateAttr'
import getAttr from '../../libs/provoda/provoda/getAttr'

/*
  ANIMATION IS BROKEN
*/

const css_transform = css.transform
const transform_props = css_transform ? [css_transform] : []
//['-webkit-transform', '-moz-transform', '-o-transform', 'transform'];
const empty_transform_props = {}
transform_props.forEach(function(el) {
  empty_transform_props[el] = ''
})

const arrProtp = Array.prototype
const concat = arrProtp.concat
const concatArray = function(array_of_arrays) {
  return concat.apply(arrProtp, array_of_arrays)
}

export const getLevNum = (view_with_highway, bwlev) => {
  if (!bwlev) {
    throw new Error('expecting bwlev')
  }

  const target_md = getModelFromR(view_with_highway, bwlev)
  return getAttr(target_md, 'map_level_num')
}


export default function(view, bwlev, navigation_changes, animation_data) {
  let all_changhes = spv.filter(navigation_changes, 'changes')
  all_changhes = concatArray(all_changhes)
  const models = spv.filter(all_changhes, 'target')
  let i

  if (!view.changes_number) {
    view.changes_number = 0
  }

  view.changes_number++

  const changes_number = view.changes_number

  view.markAnimationStart(models, changes_number)

  // TODO: find way to not remove important things, but just hide (performance optimisation)
  for (let i = 0; i < all_changhes.length; i++) {
    const cur = all_changhes[i]
    if (cur.value) {continue}
    view.removeChildViewsByMd(view.getStoredMpx(getModelFromR(view, cur.bwlev)), 'map_slice')
  }

  for (i = 0; i < all_changhes.length; i++) {
    const change = all_changhes[i]
    const handler = view['model-mapch'][change.type]
    if (handler) {
      handler.call(view, change)
    }
  }

  if (bwlev) {
    const current_lev_num = getLevNum(view, bwlev)

    if (animation_data) {
      _updateAttr(view, 'disallow_animation', true)
      animation_data.lc.c.css(animation_data.transform_values)
      _updateAttr(view, 'disallow_animation', false)
    }

    _updateAttr(view, 'current_lev_num', current_lev_num)
    //сейчас анимация происходит в связи с сменой класса при изменении состояния current_lev_num

    if (animation_data && animation_data.lc) {
      /*
        TODO: refactor lack of sync_opts
      */

      animation_data.lc.c.height() //заставляем всё пересчитать
      animation_data.lc.c.css(empty_transform_props)
      /*view.nextLocalTick(function() {

      });*/
      animation_data.lc.c.height() //заставляем всё пересчитать
    }

  }
  const completeAnimation = function() {
    view.markAnimationEnd(models, changes_number)
  }
  setTimeout(completeAnimation, 16 * 21 * 4)
  if (!animation_data) {
    completeAnimation()
  } else {
    animation_data.lc.onTransitionEnd(completeAnimation)
  }
}
