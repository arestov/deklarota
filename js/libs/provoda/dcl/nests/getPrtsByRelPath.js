import getRelShape from './getRelShape'
import {recurGetPrtByRelLinking} from './getRelConstr'


const getPrtsByRelPath = (self, rel_path, soft_check) => {

  let list_to_check = [self]
  let next_check = []

  for (let i = 0; i < rel_path.length; i++) {
    const step = rel_path[i]
    for (let jj = 0; jj < list_to_check.length; jj++) {
      const item_to_check = list_to_check[jj]
      const rel_shape = getRelShape(item_to_check, step)
      if (rel_shape && rel_shape.any) {
        continue
      }
      // eslint-disable-next-line no-use-before-define
      const refered_prt = rel_shape && getRelConstrByRelLinking(item_to_check, rel_shape.constr_linking)

      if (!refered_prt) {

        console.warn('🧶', 'cant find rel', step, rel_path, self.__code_path)
        if (!soft_check) {
          throw new Error('cant find rel')
        }
        continue

      }

      if (Array.isArray(refered_prt)) {
        next_check.push(...refered_prt)
      } else {
        next_check.push(refered_prt)
      }

    }
    const reuse = list_to_check
    reuse.length = 0
    list_to_check = next_check
    next_check = reuse
  }
    // debugger

  return list_to_check
}

const getRelConstrByRelLinking = recurGetPrtByRelLinking(getPrtsByRelPath)

export { getRelConstrByRelLinking }
export default getPrtsByRelPath
