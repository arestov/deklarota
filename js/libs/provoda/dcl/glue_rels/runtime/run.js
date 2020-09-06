import getDepValue from '../../../utils/multiPath/getDepValue'
import _updateRel from '../../../_internal/_updateRel'

import addFrom from '../../../nest-watch/addFrom'
import LocalWatchRoot from '../../../nest-watch/LocalWatchRoot'

const runGlueSources = function(self) {
  if (self.__rel_all_glue_sources == null) {
    return
  }

  for (var i = 0; i < self.__rel_all_glue_sources.length; i++) {
    var md = self
    var cur = self.__rel_all_glue_sources[i]

    // prefill
    _updateRel(self, cur.meta_relation, getDepValue(self, cur.addr))

    var lnwatch = new LocalWatchRoot(md, cur.nwatch, {
      md: self,
      meta_relation: cur.meta_relation,
      addr: cur.addr,
    })

    addFrom(md, lnwatch)
  }


}

export default runGlueSources
