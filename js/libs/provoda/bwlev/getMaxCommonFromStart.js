const getMaxCommonFromStart = (arrA, arrB) => {
  const length = Math.max(arrA.length, arrB.length)
  for (let i = 0; i < length; i++) {
    const curA = arrA[i]
    const curB = arrB[i]
    if (curA !== curB) {
      return i
    }
  }

  return length
}

export default getMaxCommonFromStart
