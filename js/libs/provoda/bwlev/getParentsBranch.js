import getBwlevParent from './getBwlevParent'
const getParentsBranch = (bwlev) => {
  let result = []

  let cur = bwlev
  while (cur) {
    result = result // mark as non const
    result.unshift(cur)
    /* so, first cur be last in array */

    cur = getBwlevParent(cur)
  }

  return result
}

export default getParentsBranch
