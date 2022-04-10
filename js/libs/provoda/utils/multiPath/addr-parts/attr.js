import splitByDot from '../../../../spv/splitByDot'
import { emptyObject } from '../../sameObjectIfEmpty'

function parseAttrPart(string) {
  if (!string) {
    return emptyObject
  }

  return {
    base: splitByDot(string)[0],
    path: string,
  }
}

export default parseAttrPart
