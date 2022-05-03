import asString from '../../../utils/multiPath/asString'
import getDepValue from '../../../utils/multiPath/getDepValue'
import isRelAddr from '../../../utils/multiPath/isRelAddr'

const prefillCompAttr = function prefillCompAttr(self, changes_list) {
  const list = self.__attrs_uniq_external_deps
  if (list == null || !list.length) {
    return
  }

  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    const value = getDepValue(self, cur)
    if (value == null) {
      continue
    }
    // it's ok to skip empty array rel values. (it's prefilled)
    if (isRelAddr(cur) && Array.isArray(value) && !value.length) {
      continue
    }

    changes_list.push(asString(cur), value)
  }

}

export default prefillCompAttr
