import emptyArray from '../emptyArray'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sameArrayIfEmpty = <Input extends any[] | null> (arr: Input | null): (null | Input | typeof emptyArray) => {
  if (arr == null) {
    return null
  }

  if (arr.length) {
    return arr as Input
  }

  return emptyArray
}

export default sameArrayIfEmpty
