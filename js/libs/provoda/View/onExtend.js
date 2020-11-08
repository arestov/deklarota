
import spv from '../../spv'
import extendDclCache, { extendCompAttrs } from '../dcl/extendDclCache'

import getTypedDcls from '../dcl-h/getTypedDcls'
import collectCompxs from '../dcl/attrs/comp/build'
import parseCompItems from '../dcl/attrs/comp/parseItems'
import extendByServiceAttrs from '../dcl/attrs/comp/extendByServiceAttrs'
import buildInputAttrs from '../dcl/attrs/input/build'
import checkEffects from '../dcl/effects/check'
import collectSelectorsOfCollchs from '../dcl_view/collectSelectorsOfCollchs'
import collectCollectionChangeDeclarations from '../dcl_view/collectCollectionChangeDeclarations'
import changeChildrenViewsDeclarations from '../dcl_view/changeChildrenViewsDeclarations'
import collectStateChangeHandlers from '../dcl_view/v-collectStateChangeHandlers'
import checkNestBorrow from '../dcl_view/nest_borrow/check-dcl'
import checkNestBorrowWatch from '../dcl_view/nest_borrow/watch'
import checkSpyglass from '../dcl_view/spyglass/check-dcl'
var cloneObj = spv.cloneObj

var getBaseTreeCheckList = function(start) {
  var i, result = []
  var chunks_counter = 0
  var all_items = [null, start]

  while (all_items.length) {


    var cur_parent = all_items.shift()
    var cur = all_items.shift()

    cur.parent = cur_parent
    cur.chunk_num = chunks_counter

    if (cur.children_by_selector) {
      for (i = cur.children_by_selector.length - 1; i >= 0; i--) {
        all_items.push(cur, cur.children_by_selector[i])
      }
    }

    if (cur.children_by_anchor) {
      for (i = cur.children_by_anchor.length - 1; i >= 0; i--) {
        all_items.push(cur, cur.children_by_anchor[i])
      }

    }

    result.push(cur)
    chunks_counter++


  }
  return result

}

export default function(self, props, original) {
  extendDclCache(self, '__dcls_attrs', props['attrs'])

  var effects = props['effects']
  extendDclCache(self, '__dcls_effects_api', effects && effects['api'])
  extendDclCache(self, '__dcls_effects_consume', effects && effects['consume'])
  extendDclCache(self, '__dcls_effects_produce', effects && effects['produce'])


  var typed_state_dcls = getTypedDcls(props['attrs']) || {}

  checkNestBorrow(self, props)
  // check effects
  checkSpyglass(self, props)


  collectStateChangeHandlers(self, props)
  collectCollectionChangeDeclarations(self, props)

  collectSelectorsOfCollchs(self, props)

  checkEffects(self, props)
  extendCompAttrs(self, typed_state_dcls, '__dcls_comp_attrs_from_effects')

  parseCompItems(typed_state_dcls && typed_state_dcls['comp'])
  extendByServiceAttrs(self, props, typed_state_dcls)
  extendCompAttrs(self, typed_state_dcls, '__dcls_comp_attrs_glue')

  collectCompxs(self, props, typed_state_dcls && typed_state_dcls['comp'])
  buildInputAttrs(self, props, typed_state_dcls && typed_state_dcls['input'])

  var base_tree_mofified = props.hasOwnProperty('base_tree')
  if (base_tree_mofified) {
    self.base_tree_list = props.base_tree && getBaseTreeCheckList(props.base_tree)
  }

  changeChildrenViewsDeclarations(self, props)

  if (props.tpl_events) {
    self.tpl_events = {}
    cloneObj(self.tpl_events, original.tpl_events)
    cloneObj(self.tpl_events, props.tpl_events)
  }

  if (props.tpl_r_events) {
    self.tpl_r_events = {}
    cloneObj(self.tpl_r_events, original.tpl_r_events)
    cloneObj(self.tpl_r_events, props.tpl_r_events)
  }

  checkNestBorrowWatch(self, props)
}
