import getNesting from '../provoda/getNesting'
import { getMaxCommonFromStart } from './getMaxCommonFromStart'

export const isOneStepZoomIn = (list) => list.length == 1 && list[0].name == 'zoom-in' && list[0].changes.length < 3

const pathAsSteps = function(path, value) {
  if (!path) {return}
  const result = new Array(path.length)
  for (let i = 0; i < path.length; i++) {
    const cur = path[i]

    result[i] = {
      type: 'move-view',
      value: value,
      bwlev: cur,
      target: getNesting(cur, 'pioneer')
    }
  }

  return result
}

const last = (list) => list && list[list.length - 1]


export const zoomingAndConverting = (converting) => (value_full_path, oldvalue_full_path) => {
  const max_common_from_start_step = getMaxCommonFromStart(value_full_path, oldvalue_full_path)

  const value_path_to = value_full_path.slice(max_common_from_start_step)
  const oldvalue_path_from = oldvalue_full_path.slice(max_common_from_start_step).reverse()

  const changes_wrap = []
  if (oldvalue_path_from?.length) {
    changes_wrap.push({
      name: 'zoom-out',
      changes: converting(oldvalue_path_from, false)
    })
  }
  if (value_path_to?.length) {
    changes_wrap.push({
      name: 'zoom-in',
      changes: converting(value_path_to, true)
    })
  }

  return changes_wrap
}

const zooming = zoomingAndConverting(pathAsSteps)

const isEqualArrays = (arr_a, arr_b) => {
  if (arr_a.length != arr_b.length) {
    return false
  }

  for (let i = 0; i < arr_a.length; i++) {
    if (arr_a[i] !== arr_b[i]) {
      return false
    }
  }

  return true
}

const isEqual = (next, prev) => {
  if (next && !prev) {return false}
  if (!next && prev) {return false}
  return isEqualArrays(next, prev)
}

const calcChanges = (next_list, prev_list) => {
  return zooming(next_list, prev_list)
  switch (true) {
    case isEqual(next_list, prev_list):
      return []
    default:
      return zooming(next_list, prev_list)
  }
}

export default function probeDiff(value_full_path, oldvalue_full_path) {

  const bwlev = last(value_full_path)

  const changes_list = calcChanges(value_full_path, oldvalue_full_path)

  return {
    bwlev: bwlev,
    prev_bwlev: last(oldvalue_full_path),
    target: getNesting(bwlev, 'pioneer'),
    value_full_path: value_full_path,
    oldvalue_full_path: oldvalue_full_path,
    array: changes_list,
  }
}
