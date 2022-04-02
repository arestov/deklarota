
import spv from '../../../../spv'
import getNesting from '../../../provoda/getNesting'
import getRelUniq from '../../nests/uniq/getRelUniq'
import { isOk } from './isOk'
import { initItem } from './initItem'
import getRelFromInitParams from '../../../utils/getRelFromInitParams'
import { addUniqItem, findDataDup, MutUniqState } from '../../nests/uniq/MutUniqState'
import getStart from '../../../utils/multiPath/getStart'


const push = Array.prototype.push
const unshift = Array.prototype.unshift

const toArray = function(value) {
  if (!value) {
    return null
  }

  return Array.isArray(value) ? value : [value]
}

const updateModelByData = (md, data) => {

  md.updateManyAttrs(data.attrs)

  if (data.interfaces) {
    for (const api_name in data.interfaces) {
      if (!Object.hasOwnProperty.call(data.interfaces, api_name)) {
        continue
      }
      md.useInterface(api_name, data.interfaces[api_name])
    }
  }

  const rels = getRelFromInitParams(data)
  if (rels) {
    for (const rel_name in rels) {
      if (!Object.hasOwnProperty.call(rels, rel_name)) {
        continue
      }
      const element = rels[rel_name]
      md.updateNesting(rel_name, element)
    }
  }
}

const initOneUniq = (mut_uniq_state, md, target, cur, mut_action_result) => {
  if (isOk(cur)) {
    // uniq/dup check of model instance will be executed in updateNesting
    return cur
  }
  const dup = findDataDup(mut_uniq_state, cur.attrs)

  if (dup == null) {
    const item = initItem(md, target, cur, mut_action_result)
    if (mut_uniq_state) {
      addUniqItem(mut_uniq_state, item)
    }
    return item
  }

  updateModelByData(dup, cur)
  return dup
}

const makeDupsChecker = (self, target, value, mut_action_result) => {
  if (self == null) {
    throw new Error('empty self')
  }
  const md = getStart(self, target.target_path)
  const rel_name = target.target_path.nesting.target_nest_name
  const uniq = getRelUniq(md, rel_name)

  return (list_to_check_raw) => {
    if (!value) {
      return value
    }

    const list = toArray(value)
    if (isOk(list)) {
      return list
    }

    const mut_uniq_state = uniq ? new MutUniqState(uniq, list_to_check_raw) : null
    const result = new Array(list.length)
    for (let i = 0; i < list.length; i++) {
      const cur = list[i]
      result[i] = initOneUniq(mut_uniq_state, md, target, cur, mut_action_result)
    }
    return result
  }
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

const toStart = function(old_value, getItems) {
  const old_list = toArray(old_value)
  const to_add = toArray(getItems(old_list))
  const result = old_list ? old_list.slice(0) : []
  if (to_add) {
    unshift.apply(result, to_add)
  }
  return result
}

const toEnd = function(old_value, getItems) {
  const old_list = toArray(old_value)
  const to_add = toArray(getItems(old_list))
  const result = old_list ? old_list.slice(0) : []

  if (to_add) {
    push.apply(result, to_add)
  }
  return result
}


const spliceList = (old_value, index, amountToRemove, getItems) => {
  if (typeof index != 'number') {
    throw 'index should be numer'
  }

  const old_list = toArray(old_value)
  const result = old_list ? old_list.slice(0) : []

  const to_add = toArray(getItems(old_list))

  if (to_add == null) {
    return result
  }

  if (amountToRemove) {
    result.splice(index, amountToRemove)
  }

  result.splice(index, 0, ...to_add)

  return result
}

const toIndex = function(old_value, index, getItems) {
  return spliceList(old_value, index, 0, getItems)
}


const replaceAt = function(old_value, index, getItems) {
  return spliceList(old_value, index, 1, getItems)
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
      return toStart(current_value, makeDupsChecker(md, target, value, mut_action_result))
    }
    case 'at_end': {
      return toEnd(current_value, makeDupsChecker(md, target, value, mut_action_result))
    }
    case 'at_index': {
      return toIndex(
        current_value,
        value[0],
        makeDupsChecker(md, target, value[1], mut_action_result)
      )
    }
    case 'replace': {
      return replaceAt(
        current_value,
        value[0],
        makeDupsChecker(md, target, value[1], mut_action_result)
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
      return makeDupsChecker(md, target, value, mut_action_result)()
    }
    //|| 'set_one'
    //|| 'replace'
    //|| 'move_to',

  }


  // d
}

export default prepareNestingValue
