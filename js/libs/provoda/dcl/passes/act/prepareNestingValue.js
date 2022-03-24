
import spv from '../../../../spv'
import getNesting from '../../../provoda/getNesting'
import get_constr from '../../../structure/get_constr'
import pushToRoute from '../../../structure/pushToRoute'
import { replaceRefs } from './replaceRefs'
import { doCopy } from '../../../../spv/cloneObj'
import { needsRefs } from './needsRefs'
import { isOk } from './isOk'

const getNestingConstr = get_constr.getNestingConstr

const push = Array.prototype.push
const unshift = Array.prototype.unshift

const toArray = function(value) {
  if (!value) {
    return null
  }

  return Array.isArray(value) ? value : [value]
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

  result.splice(index, amountToRemove, ...to_add)

  return result
}

const toIndex = function(old_value, value, index) {
  return spliceList(old_value, value, index, 0)
}


const replaceAt = function(old_value, value, index) {
  return spliceList(old_value, value, index, 1)
}

const callInit = function(md, nesting_name, value) {
  const created = pushToRoute(md, nesting_name, value.attrs)
  if (created) {
    return created
  }

  const Constr = getNestingConstr(md.app, md, nesting_name)
  if (!Constr) {
    throw new Error('cant find Constr for ' + nesting_name)
    // todo - move validation to dcl process
  }



  // expected `value` is : {attrs: {}, rels: {}}
  const init_data = {}

  doCopy(init_data, value)
  init_data.init_version = 2
  init_data.by = 'prepareNestingValue'
  const created_model = md.initSi(Constr, init_data)

  return created_model
}

const initItem = function(md, target, raw_value, mut_action_result) {
  if (isOk(raw_value)) {
    return raw_value
  }

  if (target.options.model) {
    throw new Error('implement me')
  }

  let value
  if (!needsRefs(raw_value)) {
    value = raw_value
  } else {
    if (!target.options.can_use_refs) {
      throw new Error('to use `use_ref_id` declare `can_use_refs` as option')
    }

    const local_wanted = {}
    value = replaceRefs(md, raw_value, local_wanted, mut_action_result)

    if (isOk(value)) {
      return value
    }

    if (spv.countKeys(local_wanted)) {
      doCopy(mut_action_result.mut_wanted_ref, local_wanted)
      return value
    }
  }

  const multi_path = target.target_path
  const nesting_name = multi_path.nesting.target_nest_name

  const created_model = callInit(md, nesting_name, value)

  if (value.hold_ref_id) {
    if (!target.options.can_hold_refs) {
      // we want to know if action is using hold_ref_id without executing it
      // to avoid checing hold_ref_id for every action
      throw new Error('to use `hold_ref_id` declare `can_hold_refs` as option')
    }
    if (mut_action_result.mut_refs_index[value.hold_ref_id]) {
      throw new Error('ref id holded already ' + value.hold_ref_id)
    }
    mut_action_result.mut_refs_index[value.hold_ref_id] = created_model._provoda_id
  }

  return created_model
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

const initValue = function(md, target, value, mut_action_result) {
  if (Array.isArray(value)) {
    return initItemsList(md, target, value, mut_action_result)
  }

  return initItem(md, target, value, mut_action_result)
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

prepareNestingValue.initValue = initValue

export default prepareNestingValue
