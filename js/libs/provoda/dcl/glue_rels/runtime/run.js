import getDepValue from '../../../utils/multiPath/getDepValue'
import getStart from '../../../utils/multiPath/getStart'
import _updateRel from '../../../_internal/_updateRel'
import memorize from '../../../../spv/memorize'

import isGlueRoot from './isGlueRoot'
import isGlueParent from './isGlueParent'

import getNameByValue from '../light_rel_change/getNameByValue'

const gotRelGlue = memorize(function(rel_key) {
  return function gotRelGlue(value) {
    _updateRel(this, rel_key, value)
  }
})

const unsubscribe = function(from, to, event_name, func) {
// donor.evcompanion.off(utils_simple.getSTEVNameLight(donor_state), func, false, this)
  // now only views can have events (evcompanion and off)

  throw new Error('glue rels cant use _addEventHandler anymore. dkt should make another way')

  from.evcompanion.off(event_name, func, false, to)
}

const subscribe = function(from, to, event_name, cb) {
  // copied from _bindLight
  throw new Error('glue rels cant use _addEventHandler anymore. dkt should make another way')
  // now only views can have events (evcompanion and _addEventHandler)
  from.evcompanion._addEventHandler(event_name, cb, to)

  if (to == from) {
    return
  }
}

const runGlueSources = function(self) {
  if (self.__rel_all_glue_sources == null) {
    return
  }

  for (let i = 0; i < self.__rel_all_glue_sources.length; i++) {
    const cur = self.__rel_all_glue_sources[i]

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
  }


}

export const disposeGlueSources = function(self) {
  if (self.__rel_all_glue_sources == null) {
    return
  }

  for (let i = 0; i < self.__rel_all_glue_sources.length; i++) {
    const cur = self.__rel_all_glue_sources[i]

    if (isGlueRoot(cur.addr)) {
      unsubscribe(self.app, self, getNameByValue(cur.final_rel_key), gotRelGlue(cur.meta_relation))
      continue
    }

    if (isGlueParent(cur.addr)) {
      unsubscribe(getStart(self, cur.addr), self, getNameByValue(cur.final_rel_key), gotRelGlue(cur.meta_relation))
      continue
    }

    throw new Error('get rid of LocalWatchRoot using rel-glue')
  }
}

export default runGlueSources
