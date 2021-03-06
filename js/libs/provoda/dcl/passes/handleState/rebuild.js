

import spv from '../../../../spv'
var getDeprefixFunc = spv.getDeprefixFunc
var check = getDeprefixFunc('handleAttr:')

export default function rebuild(self, index) {
  var result = {}

  for (var name in index) {
    if (!index.hasOwnProperty(name)) {
      continue
    }

    var result_name = check(name)

    if (!result_name) {
      continue
    }

    result[result_name] = index[name]
  }

  self.__handleState = result
}
