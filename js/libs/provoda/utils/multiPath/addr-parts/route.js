import getParsedPath from '../../../routes/legacy/getParsedPath'
import { emptyObject } from '../../sameObjectIfEmpty'

function parseRoutePart(string) {
  if (!string) {
    return emptyObject
  }

  if (string.startsWith('#')) {
    throw new Error('use "ascending part" for root/parent traversing')
  }

  if (string.startsWith('/')) {
    const err = new Error('route should no starts with `/`')
    console.log(string, err)
    throw err
  }

  return {
    path: string,
    template: getParsedPath(string),
  }
}

export default parseRoutePart
