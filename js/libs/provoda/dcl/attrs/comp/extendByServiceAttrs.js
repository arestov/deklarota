import { doCopy } from '../../../../spv/cloneObj'

import isGlueTargetAttr from './isGlueTargetAttr'
import makeGlueSource from './makeGlueSource'

const extendByServiceAttrs = function(self, props, typed_state_dcls) {
  var comps = typed_state_dcls['comp']

  var result = {}

  for (var prop in comps) {
    if (!comps.hasOwnProperty(prop)) {
      continue
    }
    var cur = comps[prop]

    for (var i = 0; i < cur.addrs.length; i++) {
      var glue_target_type = isGlueTargetAttr(cur.addrs[i])
      if (glue_target_type == null) {
        continue
      }
      var item_to_add = makeGlueSource(cur.addrs[i], glue_target_type)
      result[item_to_add.name] = item_to_add
    }
  }

  doCopy(comps, result)

}

export default extendByServiceAttrs
