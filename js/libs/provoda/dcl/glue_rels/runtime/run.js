import getDepValue from '../../../utils/multiPath/getDepValue'
import getStart from '../../../utils/multiPath/getStart'
import _updateRel from '../../../_internal/_updateRel'
import memorize from '../../../../spv/memorize'

import addFrom from '../../../nest-watch/addFrom'
import LocalWatchRoot from '../../../nest-watch/LocalWatchRoot'
import isGlueRoot from './isGlueRoot'
import isGlueParent from './isGlueParent'

import getNameByValue from '../light_rel_change/getNameByValue'

const gotRelGlue = memorize(function(rel_key) {
  return function gotRelGlue(value) {
    _updateRel(this, rel_key, value)
  }
})

// const unsubscribe = function(from, to, event_name, func) {
//   from.evcompanion.off(event_name, func, false, to)
// }

const subscribe = function(from, to, event_name, cb) {
  // copied from _bindLight
  from.evcompanion._addEventHandler(event_name, cb, to)

  if (to == from) {
    return
  }

  // TODO unsubscribe when disposing model
  // to.onDie(function() {
  //   if (!from) {
  //     return
  //   }
  //   unsubscribe(from, to, event_name, cb)
  //   from = null
  //   cb = null
  // })
}

const runGlueSources = function(self) {
  if (self.__rel_all_glue_sources == null) {
    return
  }

  for (var i = 0; i < self.__rel_all_glue_sources.length; i++) {
    var md = self
    var cur = self.__rel_all_glue_sources[i]

    // prefill
    _updateRel(self, cur.meta_relation, getDepValue(self, cur.addr))

    if (isGlueRoot(cur.addr)) {
      subscribe(self.app, self, getNameByValue(cur.final_rel_key), gotRelGlue(cur.meta_relation))
      continue
    }

    if (isGlueParent(cur.addr)) {
      subscribe(getStart(self, cur.addr), self, getNameByValue(cur.final_rel_key), gotRelGlue(cur.meta_relation))
      continue
    }

    throw new Error('get rid of LocalWatchRoot using rel-glue')

    var lnwatch = new LocalWatchRoot(md, cur.nwatch, {
      md: self,
      meta_relation: cur.meta_relation,
      addr: cur.addr,
    })

    addFrom(md, lnwatch)
  }


}

export default runGlueSources
