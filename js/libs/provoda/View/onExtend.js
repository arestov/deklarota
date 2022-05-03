
import spv from '../../spv'
import extendDclCache from '../dcl/extendDclCache'
import assignField from '../dcl/assignField'

import getTypedDcls from '../dcl-h/getTypedDcls'
import parseCompItems from '../dcl/attrs/comp/parseItems'
import buildAttrsFinal from '../dcl/attrs/build'
import checkEffects from '../dcl/effects/check'
import collectSelectorsOfCollchs from '../dcl_view/collectSelectorsOfCollchs'
import collectCollectionChangeDeclarations from '../dcl_view/collectCollectionChangeDeclarations'
import changeChildrenViewsDeclarations from '../dcl_view/changeChildrenViewsDeclarations'
import collectStateChangeHandlers from '../dcl_view/v-collectStateChangeHandlers'
import checkNestBorrow from '../dcl_view/nest_borrow/check-dcl'
import checkNestBorrowWatch from '../dcl_view/nest_borrow/watch'
import checkSpyglass from '../dcl_view/spyglass/check-dcl'
import validateViewAttrs from './validateViewAttrs'
const cloneObj = spv.cloneObj

const getBaseTreeCheckList = function(start) {
  let i
  const result = []
  let chunks_counter = 0
  const all_items = [null, start]

  while (all_items.length) {


    const cur_parent = all_items.shift()
    const cur = all_items.shift()

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

const completeBuild = (self) => {

  const typed_state_dcls = getTypedDcls(self.__dcls_attrs) || {}
  parseCompItems(typed_state_dcls && typed_state_dcls['comp'])

  assignField(self, '__attrs_base_comp', typed_state_dcls['comp'] || {})
  assignField(self, '__attrs_base_input', typed_state_dcls['input'] || {})


  checkEffects(self)

  buildAttrsFinal(self)
  validateViewAttrs(self)
}

export default function(self, props, original) {
  extendDclCache(self, '__dcls_attrs', props['attrs'])

  const effects = props['effects']

  if (effects) {
    if (effects.produce) {
      throw new Error('use `out` section for output effects')
    }
    if (effects.consume) {
      throw new Error('use `in` section for input effects')
    }
  }

  extendDclCache(self, '__dcls_effects_api', effects && effects['api'])
  extendDclCache(self, '__dcls_effects_consume', effects && effects['in'])
  extendDclCache(self, '__dcls_effects_produce', effects && effects['out'])


  checkNestBorrow(self, props)
  // check effects
  checkSpyglass(self, props)


  collectStateChangeHandlers(self, props)
  collectCollectionChangeDeclarations(self, props)

  collectSelectorsOfCollchs(self, props)


  const base_tree_mofified = props.hasOwnProperty('base_tree')
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
  completeBuild(self)
}
