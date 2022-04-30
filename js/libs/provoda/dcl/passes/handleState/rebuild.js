

import spv from '../../../../spv'
const getDeprefixFunc = spv.getDeprefixFunc
const check = getDeprefixFunc('handleAttr:')

export const $actions$handle_attr = [
  ['$actions$combo'],
  (index) => {
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

    return result
  }
]
