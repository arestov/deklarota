export const getMaxCommonFromStart = (arrA, arrB) => {
  const length = Math.min(arrA.length, arrB.length)
  for (let i = 0; i < length; i++) {
    const curA = arrA[i]
    const curB = arrB[i]
    if (curA !== curB) {
      return i
    }
  }

  return length
}

const fromEnd = (arr, i) => {
  return arr[(arr.length - 1) - i]
}

export const getMaxCommonFromEnd = (arrA, arrB) => {
  const length = Math.min(arrA.length, arrB.length)
  for (let i = 0; i < length; i++) {
    const curA = fromEnd(arrA, i)
    const curB = fromEnd(arrB, i)

    if (curA !== curB) {
      return i
    }
  }

  return length
}
