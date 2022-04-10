import { isObjectEmpty } from '../../spv'

const emptyObject = {} as const
Object.freeze(emptyObject)

export { emptyObject }

const sameObjectIfEmpty = <Input>(object: Input): null | Input | typeof emptyObject => {
  if (object == null) {
    return null
  }

  if (isObjectEmpty(object)) {
    return emptyObject
  }

  return object
}

export default sameObjectIfEmpty
