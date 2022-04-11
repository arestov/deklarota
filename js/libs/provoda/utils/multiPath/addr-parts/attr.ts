import splitByDot from '../../../../spv/splitByDot'
import type { EmptyObject } from '../../empty.types'
import { emptyObject } from '../../sameObjectIfEmpty'
import type { AttrPartOfAddr, AttrPath } from './attr.types'

function parseAttrPart(string: string | null): EmptyObject | AttrPartOfAddr {
  if (!string) {
    return emptyObject
  }

  const base = (splitByDot(string) as AttrPath)[0]
  if (!base) {
    throw new Error('base part of addr path can\'t be empty')
  }

  return {
    base,
    path: string,
  }
}

export default parseAttrPart
