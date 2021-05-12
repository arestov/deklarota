import { countKeys } from '../../spv'

const emptyObject = Object.freeze({})

const sameObjectIfEmpty = (object) => {
  if (object == null) {
    return null
  }

  if (!countKeys(object)) {
    return emptyObject
  }

  return object
}

export default sameObjectIfEmpty
