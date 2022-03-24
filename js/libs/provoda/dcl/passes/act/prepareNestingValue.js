
import spv from '../../../../spv'
import getNesting from '../../../provoda/getNesting'
import { isOk } from './isOk'
import { initItem } from './initItem'


const push = Array.prototype.push
const unshift = Array.prototype.unshift

const toArray = function(value) {
  if (!value) {
    return null
  }

  return Array.isArray(value) ? value : [value]
}

const initItemsList = function(md, target, value, mut_action_result) {
  if (!value) {
    return value
  }

  const list = toArray(value)
  if (isOk(list)) {
    return list
  }

  const result = new Array(list.length)
  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    result[i] = initItem(md, target, cur, mut_action_result)
  }
  return result
}

const without = function(old_value, value) {
  if (!old_value || (Array.isArray(old_value) && !old_value.length)) {
    // nothing to erase. keep that old "nothing" value
    return old_value
  }

  if (!Array.isArray(old_value)) {

    // erase old value it is input
    if (!Array.isArray(value)) {
      return old_value === value ? null : old_value
    }

    // erase old value if it was in input
    if (value.indexOf(old_value) != -1) {
      return null
    }

    // keep old value
    return old_value
  }

  return spv.arrayExclude(old_value, value)
}

const toStart = function(old_value, value) {
  const old_list = toArray(old_value)
  const to_add = toArray(value)
  const result = old_list ? old_list.slice(0) : []
  if (to_add) {
    unshift.apply(result, to_add)
  }
  return result
}

const toEnd = function(old_value, value) {
  const old_list = toArray(old_value)
  const to_add = toArray(value)
  const result = old_list ? old_list.slice(0) : []

  if (to_add) {
    push.apply(result, to_add)
  }
  return result
}


const spliceList = (old_value, value, index, amountToRemove) => {
  if (typeof index != 'number') {
    throw 'index should be numer'
  }

  const old_list = toArray(old_value)
  const to_add = toArray(value)
  const result = old_list ? old_list.slice(0) : []

  if (to_add == null) {
    return result
  }

  if (amountToRemove) {
    result.splice(index, amountToRemove)
  }

  result.splice(index, 0, ...to_add)

  return result
}

const toIndex = function(old_value, value, index) {
  return spliceList(old_value, value, index, 0)
}


const replaceAt = function(old_value, value, index) {
  return spliceList(old_value, value, index, 1)
}

const prepareNestingValue = function(md, target, value, mut_action_result) {
  const multi_path = target.target_path

  if (!target.options.method) {
    if (!isOk(value)) {
      throw new Error('unexpected nesting')
    }

    return value
  }

  const nesting_name = multi_path.nesting.target_nest_name
  const current_value = getNesting(md, nesting_name)


  switch (target.options.method) {
    case 'without': {
      return without(current_value, value)
    }
    case 'at_start': {
      return toStart(current_value, initItemsList(md, target, value, mut_action_result))
    }
    case 'at_end': {
      return toEnd(current_value, initItemsList(md, target, value, mut_action_result))
    }
    case 'at_index': {
      return toIndex(
        current_value,
        initItemsList(md, target, value[1], mut_action_result),
        value[0]
      )
    }
    case 'replace': {
      return replaceAt(
        current_value,
        initItemsList(md, target, value[1], mut_action_result),
        value[0]
      )
    }
    case 'set_one': {
      if (value && Array.isArray(value)) {
        throw new Error('value should not be list')
      }
      return initItem(md, target, value, mut_action_result)
    }
    case 'set_many': {
      if (value && !Array.isArray(value)) {
        throw new Error('value should be list')
      }
      return initItemsList(md, target, value, mut_action_result)
    }
    //|| 'set_one'
    //|| 'replace'
    //|| 'move_to',

  }


  // d
}

export default prepareNestingValue
