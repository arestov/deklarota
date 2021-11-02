import getRelShape from './getRelShape'
import {getRelConstrByRelLinking} from './getRelConstr'

const getRelPathConstrs = (self, rel_path, soft_check) => {

  var list_to_check = [self]
  var next_check = []

  for (let i = 0; i < rel_path.length; i++) {
    const step = rel_path[i]
    for (let jj = 0; jj < list_to_check.length; jj++) {
      const item_to_check = list_to_check[jj]
      const rel_shape = getRelShape(item_to_check, step)
      if (rel_shape && rel_shape.any) {
        continue
      }
      const proto = rel_shape && getRelConstrByRelLinking(item_to_check, rel_shape.constr_linking)

      if (!proto) {
        console.warn('🧶', 'cant find rel', step, rel_path, self.__code_path)
        if (soft_check) {
          continue
        }

        throw new Error('cant find rel')
      }

      if (Array.isArray(proto)) {
        next_check.push(...proto)
      } else {
        next_check.push(proto)
      }

    }
    const reuse = list_to_check
    reuse.length = 0
    list_to_check = next_check
    next_check = reuse
  }
    // debugger

  return next_check
}

export default getRelPathConstrs
