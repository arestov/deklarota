import { getMaxCommonFromStart, getMaxCommonFromEnd } from './getMaxCommonFromStart'

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
    }
  }

  return result
}

const last = (list) => list && list[list.length - 1]

export const isZoomingOnly = (list) => {
  const firstItem = list[0]
  const lastItem = last(list)
  return firstItem.name == 'zoom-in' && lastItem.name == 'zoom-in'
}


export const zoomingAndConverting = (converting) => (value_full_path, oldvalue_full_path) => {
  /*
    zooming:
    [1, 2, 3, 4, 5, 6] -> [1, 2, 3, 4, 7, 8, 11]
  */

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

export const traveling = (next_list, prev_list) => {
  /*
    traveling of base: same final destination (prev/next), but changes in base
    [1, 2, 3, 4, 5, 6] -> [1, 8, 5, 6]

    remove-base - batch
      remove-lev - chunk
    add-base
      add-lev
  */
  const common_from_start = getMaxCommonFromStart(next_list, prev_list)
  const common_from_end = getMaxCommonFromEnd(next_list, prev_list)

  const to_remove = prev_list.slice(common_from_start, -common_from_end)
  const to_update = next_list.slice(-common_from_end)
  const to_add = next_list.slice(common_from_start, -common_from_end).reverse()

  /*
    clean (prepare) from start to end of list
    update common end () from start to end of list
    add(readd) new items from end to start of list
  */

  return [
    {
      name: 'travebasing-remove',
      changes: to_remove.map(cur => ({
        type: 'travebasing-remove',
        bwlev: cur,
      }))
    },
    {
      name: 'travebasing-update',
      changes: to_update.map(cur => ({
        type: 'travebasing-update',
        bwlev: cur,
      }))
    },
    {
      name: 'travebasing-add',
      changes: to_add.map(cur => ({
        type: 'travebasing-add',
        bwlev: cur,
      }))
    },
  ]

  return [to_remove, to_update, to_add.reverse()]
}

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

const isZooming = (next_list, prev_list) => {
  const next = last(next_list)
  const prev = last(prev_list)

  // it's ok to zoom-out and zoom-in when final destination is different from prev destination
  return next !== prev
}

const calcChanges = (next_list, prev_list) => {
  switch (true) {
    case isEqual(next_list, prev_list):
      return []
    case isZooming(next_list, prev_list):
      return zooming(next_list, prev_list)
    default:
      return traveling(next_list, prev_list)
  }
}

export default function probeDiff(value_full_path, oldvalue_full_path) {

  const bwlev = last(value_full_path)

  const changes_list = calcChanges(value_full_path, oldvalue_full_path)

  return {
    bwlev: bwlev,
    prev_bwlev: last(oldvalue_full_path),
    value_full_path: value_full_path,
    oldvalue_full_path: oldvalue_full_path,
    array: changes_list,
  }
}
