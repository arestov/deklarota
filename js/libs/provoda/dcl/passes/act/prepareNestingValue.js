
import spv from '../../../../spv'
import getRelFromInitParams from '../../../utils/getRelFromInitParams'
import getNesting from '../../../provoda/getNesting'
import get_constr from '../../../structure/get_constr'
import getModelById from '../../../utils/getModelById'
import pushToRoute from '../../../structure/pushToRoute'

const cloneObj = spv.cloneObj
const getNestingConstr = get_constr.getNestingConstr

const push = Array.prototype.push
const unshift = Array.prototype.unshift
const splice = Array.prototype.splice

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

const toIndex = function(old_value, value, index) {
  if (typeof index != 'number') {
    throw 'index should be numer'
  }
  const old_list = toArray(old_value)
  const to_add = toArray(value)
  const result = old_list ? old_list.slice(0) : []

  if (to_add) {
    for (let i = 0; i < to_add.length; i++) {
      splice.call(result, index + i, 0, to_add[i])
    }
  }

  return result
}

const replaceAt = function(old_value, value, index) {
  if (typeof index != 'number') {
    throw 'index should be numer'
  }

  const old_list = toArray(old_value)
  const to_add = toArray(value)
  const result = old_list ? old_list.slice(0) : []

  if (to_add) {
    for (let i = 0; i < to_add.length; i++) {
      splice.call(result, index + i, 1, to_add[i])
    }
  }

  return result
}

var needsRefs = function(init_data) {
  const rels = getRelFromInitParams(init_data)
  for (const nesting_name in rels) {
    if (!rels.hasOwnProperty(nesting_name)) {
      continue
    }
    const cur = rels[nesting_name]

    if (cur == null) {
      continue
    }
    if (!Array.isArray(cur)) {
      if (needsRefs(cur)) {
        return true
      }
      continue
    }

    if (cur.some(needsRefs)) {
      return true
    }

  }

  if (init_data.use_ref_id) {
    return true
  }

}

var replaceRefs = function(md, init_data, mut_wanted_ref, mut_refs_index) {
  if (init_data.use_ref_id) {
    if (mut_refs_index[init_data.use_ref_id]) {
      return getModelById(md, mut_refs_index[init_data.use_ref_id])
    }



    mut_wanted_ref[init_data.use_ref_id] = init_data.use_ref_id

    return init_data
  }


  const result = cloneObj({}, init_data)
  const rels = getRelFromInitParams(init_data)
  if (rels) {
    result.rels = cloneObj({}, rels)
  }

  for (const nesting_name in rels) {
    if (!rels.hasOwnProperty(nesting_name)) {
      continue
    }
    const cur = rels[nesting_name]
    if (!Array.isArray(cur)) {
      result.rels[nesting_name] = replaceRefs(md, cur, mut_wanted_ref, mut_refs_index)
      continue
    }

    const list = []
    for (let i = 0; i < cur.length; i++) {
      list.push(replaceRefs(md, cur[i], mut_wanted_ref, mut_refs_index))
    }
  }

  return result
}

const callInit = function(md, nesting_name, value) {
  const created = pushToRoute(md, nesting_name, value.states)
  if (created) {
    return created
  }

  const Constr = getNestingConstr(md.app, md, nesting_name)
  if (!Constr) {
    throw new Error('cant find Constr for ' + nesting_name)
    // todo - move validation to dcl process
  }



  // expected `value` is : {states: {}, rels: {}}
  const init_data = {}

  cloneObj(init_data, value)
  init_data.init_version = 2
  init_data.by = 'prepareNestingValue'
  const created_model = md.initSi(Constr, init_data)

  return created_model
}

const useRefIfNeeded = function(md, raw_value, mut_refs_index, _mut_wanted_ref) {
  if (isOk(raw_value)) {
    return raw_value
  }

  if (!needsRefs(raw_value)) {
    return raw_value
  }

  return replaceRefs(md, raw_value, {}, mut_refs_index)
}

const initItem = function(md, target, raw_value, mut_refs_index, mut_wanted_ref) {
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
    const local_wanted = {}
    value = replaceRefs(md, raw_value, local_wanted, mut_refs_index)

    if (isOk(value)) {
      return value
    }

    if (spv.countKeys(local_wanted)) {
      cloneObj(mut_wanted_ref, local_wanted)
      return value
    }
  }

  const multi_path = target.target_path
  const nesting_name = multi_path.nesting.target_nest_name

  const created_model = callInit(md, nesting_name, value)

  if (value.hold_ref_id) {
    if (mut_refs_index[value.hold_ref_id]) {
      throw new Error('ref id holded already ' + value.hold_ref_id)
    }
    mut_refs_index[value.hold_ref_id] = created_model._provoda_id
  }

  return created_model
}

const initItemsList = function(md, target, value, mut_refs_index, mut_wanted_ref) {
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
    result[i] = initItem(md, target, cur, mut_refs_index, mut_wanted_ref)
  }
  return result
}

const initValue = function(md, target, value, mut_refs_index, mut_wanted_ref) {
  if (Array.isArray(value)) {
    return initItemsList(md, target, value, mut_refs_index, mut_wanted_ref)
  }

  return initItem(md, target, value, mut_refs_index, mut_wanted_ref)
}

const initPassedValue = function(md, target, value, mut_refs_index, mut_wanted_ref) {
  switch (target.options.method) {
    case 'at_index':
    case 'replace': {
      return [
        value[0],
        initValue(md, target, value[1], mut_refs_index, mut_wanted_ref),
      ]
    }
  }

  return initValue(md, target, value, mut_refs_index, mut_wanted_ref)
}

const prepareNestingValue = function(md, target, value, mut_refs_index, mut_wanted_ref) {
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
      return toStart(current_value, initItemsList(md, target, value, mut_refs_index, mut_wanted_ref))
    }
    case 'at_end': {
      return toEnd(current_value, initItemsList(md, target, value, mut_refs_index, mut_wanted_ref))
    }
    case 'at_index': {
      return toIndex(
        current_value,
        initItemsList(md, target, value[1], mut_refs_index, mut_wanted_ref),
        value[0]
      )
    }
    case 'replace': {
      return replaceAt(
        current_value,
        initItemsList(md, target, value[1], mut_refs_index, mut_wanted_ref),
        value[0]
      )
    }
    case 'set_one': {
      if (value && Array.isArray(value)) {
        throw new Error('value should not be list')
      }
      return initItem(md, target, value, mut_refs_index, mut_wanted_ref)
    }
    case 'set_many': {
      if (value && !Array.isArray(value)) {
        throw new Error('value should be list')
      }
      return initItemsList(md, target, value, mut_refs_index, mut_wanted_ref)
    }
    //|| 'set_one'
    //|| 'replace'
    //|| 'move_to',

  }


  // d
}

prepareNestingValue.initValue = initValue
prepareNestingValue.initPassedValue = initPassedValue
prepareNestingValue.useRefIfNeeded = useRefIfNeeded

export default prepareNestingValue

function isProvodaBhv(md) {
  return md.hasOwnProperty('_provoda_id') || md.hasOwnProperty('view_id')
}

function isOk(list) {
  if (!list) {
    return true
  }

  if (!Array.isArray(list)) {
    return isProvodaBhv(list)
  }


  if (!list.length) {
    return true
  }

  return list.every(isProvodaBhv)

}
