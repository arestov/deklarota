import memorize from '../../../../spv/memorize'
import { emptyObject } from '../../sameObjectIfEmpty'

const root = Object.freeze({
  type: 'root',
  steps: null,
})

export const parents = memorize(function(num) {
  return Object.freeze({
    type: 'parent',
    steps: num,
  })
})

const parent_count_regexp = /\^+/gi

export function parseAscendorPart(string) {
  if (!string) {
    return emptyObject
  }

  if (string == '#') {
    return root
  }

  const from_parent_num = string.match(parent_count_regexp)
  if (from_parent_num) {
    return parents(from_parent_num[0].length)
  }

  throw new Error('unsupported base: ' + string)
}
