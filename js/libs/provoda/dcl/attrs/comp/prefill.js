import asString from '../../../utils/multiPath/asString'
import getDepValue from '../../../utils/multiPath/getDepValue'
import isNestingAddr from './isNestingAddr'

const prefillCompAttr = function prefillCompAttr(self, changes_list) {
  var list = self.__attrs_uniq_external_deps
  if (list == null || !list.length) {
    return
  }

  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    var value = getDepValue(self, cur)
    if (value == null) {
      continue
    }

    if (isNestingAddr(cur) && Array.isArray(value) && !value.length) {
      continue
    }

    changes_list.push(asString(cur), value)
  }

}

export default prefillCompAttr
