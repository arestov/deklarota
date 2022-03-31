import stringifyRoute from '../../routes/stringify'
import pvState from '../../utils/state'

const areStatesValid = function(md, states) {
  for (let jj = 0; jj < states.length; jj++) {
    const cur = states[jj]
    const value = pvState(md, cur)
    if (value == null) {
      return false
    }
  }

  return true
}
const makeMatchingData = (mut_result, dcl, self, ordered_items) => {
  mut_result.length = 0
  if (!ordered_items) {
    return
  }


  for (let i = 0; i < ordered_items.length; i++) {
    const cur = ordered_items[i]
    if (!areStatesValid(cur, dcl.states)) {
      continue
    }

    const key = stringifyRoute(dcl.route, cur.states)
    mut_result.push(key, cur)
  }


  self.__modern_subpages_valid = false
  self.__modern_subpages = null
}

export default makeMatchingData
