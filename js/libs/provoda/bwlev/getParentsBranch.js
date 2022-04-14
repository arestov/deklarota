import isBwlevName from '../utils/isBwlevName'
import getBwlevParent from './getBwlevParent'
const getParentsBranch = (bwlev) => {
  let result = []

  let cur = bwlev
  while (cur) {
    /* throw can be removed when be sure that there is no code calling getParentsBranch with usual model */
    if (!isBwlevName(cur.model_name)) {
      throw new Error('consider to use getRouteStepParent for none bwlev model')
    }

    result = result // mark as non const
    result.unshift(cur)
    /* so, first cur be last in array */

    cur = getBwlevParent(cur)
  }

  return result
}

export default getParentsBranch
