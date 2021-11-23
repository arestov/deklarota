

import spv from '../../../../spv'
const getDeprefixFunc = spv.getDeprefixFunc
const check = getDeprefixFunc('handleAttr:')

export default function rebuild(self, index) {
  const result = {}

  for (const name in index) {
    if (!index.hasOwnProperty(name)) {
      continue
    }

    const result_name = check(name)

    if (!result_name) {
      continue
    }

    result[result_name] = index[name]
  }

  self.__handleState = result
}
