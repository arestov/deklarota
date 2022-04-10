import { emptyObject } from '../../sameObjectIfEmpty'
import type { ParentAscendor, RootAscendor } from './ascendor.types'
import memorize from '../../../../spv/memorize'
import type { EmptyObject } from '../../empty.types'

const root: RootAscendor = Object.freeze({
  type: 'root',
  steps: null,
})

export const parents = memorize(function(num: number): ParentAscendor {
  return Object.freeze({
    type: 'parent',
    steps: num,
  })
})

const parent_count_regexp = /\^+/gi

export function parseAscendorPart(string: string): EmptyObject | RootAscendor | ParentAscendor {
  if (!string) {
    return emptyObject
  }

  if (string == '#') {
    return root
  }

  const from_parent_num = string.match(parent_count_regexp)
  if (from_parent_num?.[0] == null) {
    throw new Error('unsupported base: ' + string)
  }

  return parents(from_parent_num[0].length)


}
