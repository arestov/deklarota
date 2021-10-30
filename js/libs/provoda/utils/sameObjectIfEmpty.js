import { isObjectEmpty } from '../../spv'

export const emptyObject = Object.freeze({})

const sameObjectIfEmpty = (object) => {
  if (object == null) {
    return null
  }

  if (isObjectEmpty(object)) {
    return emptyObject
  }

  return object
}

export default sameObjectIfEmpty
