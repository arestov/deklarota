import emptyArray from '../emptyArray'

const sameArrayIfEmpty = (arr) => {
  if (arr == null) {
    return null
  }

  if (arr.length) {
    return arr
  }

  return emptyArray
}

export default sameArrayIfEmpty
