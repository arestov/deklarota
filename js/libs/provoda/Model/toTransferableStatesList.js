
import isPrivate from './isPrivateState'
const CH_GR_LE = 2

const hasId = function(value) {
  return value && value._provoda_id
}



function toTransferableStatesList(states_raw) {

  let needs_changes
  let fixed_values
  const states = states_raw

  for (let jj = 1; jj < states.length; jj += CH_GR_LE) {
    const cur_value = states[jj]

    if (isPrivate(states[jj - 1])) {

      needs_changes = true
      if (!fixed_values) {
        fixed_values = states.slice()
      }

      fixed_values[jj] = null
    }

    if (!hasId(cur_value)) {
      continue
    }

    needs_changes = true
    if (!fixed_values) {
      fixed_values = states.slice()
    }

    fixed_values[jj] = {
      _provoda_id: states[jj]._provoda_id
    }
    //fixme, отправляя _provoda_id мы не отправляем модели
    //которые могли попасть в состояния после отправки ПОДДЕЛКИ текущей модели

    //needs_changes
  }

  return needs_changes ? fixed_values : states

}

export default toTransferableStatesList
