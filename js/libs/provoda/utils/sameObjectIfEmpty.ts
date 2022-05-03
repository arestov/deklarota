import { isObjectEmpty } from '../../spv'
import type { EmptyObject } from './empty.types'


const emptyObject: EmptyObject = {}
Object.freeze(emptyObject)
export { emptyObject }

const sameObjectIfEmpty = <Input>(object: Input): null | Input | EmptyObject => {
  if (object == null) {
    return null
  }

  if (isObjectEmpty(object)) {
    return emptyObject
  }

  return object
}

export default sameObjectIfEmpty
