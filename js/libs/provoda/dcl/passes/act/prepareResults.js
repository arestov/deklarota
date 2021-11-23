
import getTargetModels from './getTargetModels'
import prepareNestingValue from './prepareNestingValue'
import spv from '../../../../spv'
import noopForPass from '../noop'
const countKeys = spv.countKeys
const initPassedValue = prepareNestingValue.initPassedValue

const isRedirectAction = function(target) {
  return Boolean(target.options && target.options.action)
}

const prepareAndHold = function(md, target, value, mut_refs_index, mut_wanted_ref) {
  const multi_path = target.target_path

  switch (multi_path.result_type) {
    case 'nesting': {
      return {
        target: target,
        target_md: md,
        value: initPassedValue(md, target, value, mut_refs_index, mut_wanted_ref)
      }
      return
    }
    case 'state': {
      return {target: target, target_md: md, value: value}
    }
  }
}

const getProperDestValue = function(target, value, i) {
  // when `pass` option map_values_list_to_target === true
  // map value from values list to model from targets list

  if (!target.options || !target.options.map_values_list_to_target) {
    return value
  }

  if (i == null) {
    throw new Error('i should be provied')
  }

  return value[i]
}

const unwrap = function(md, target, value, data, mut_refs_index, mut_wanted_ref, mut_result) {
  if (isRedirectAction(target)) {
    var models = getTargetModels(md, target, data)
    if (!Array.isArray(models)) {
      mut_result.push({
        target: target,
        target_md: models,
        value: prepareNestingValue.useRefIfNeeded(md, getProperDestValue(target, value, 0), mut_refs_index, mut_wanted_ref)
      })
      return
    }

    for (var i = 0; i < models.length; i++) {
      var cur = models[i]
      mut_result.push({
        target: target,
        target_md: cur,
        value: prepareNestingValue.useRefIfNeeded(md, getProperDestValue(target, value, i), mut_refs_index, mut_wanted_ref)})
    }
    return
  }

  if (target.path_type == 'by_provoda_id') {
    mut_result.push({target: target, md: md, value: value, data: data})
    return
  }

  var models = getTargetModels(md, target, data)

  if (value && target.options && target.options.map_values_list_to_target) {
    if (value.length !== models.length) {
      throw new Error('values list length should match target list length')
    }
  }

  if (Array.isArray(models)) {
    for (var i = 0; i < models.length; i++) {
      var cur = models[i]
      mut_result.push(
        prepareAndHold(cur, target, getProperDestValue(target, value, i), mut_refs_index, mut_wanted_ref, mut_result)
      )
    }
  } else {
    mut_result.push(
      prepareAndHold(models, target, getProperDestValue(target, value, null), mut_refs_index, mut_wanted_ref, mut_result)
    )
  }

}

const completeValues = function(list, mut_refs_index, mut_wanted_ref) {
  let lst_wanted = mut_wanted_ref

  while (true) {
    const local_wanted = {}

    for (let i = 0; i < list.length; i++) {
      const cur = list[i]
      const target = cur.target
      if (isRedirectAction(target)) {
        continue
      }
      const multi_path = target.target_path
      if (multi_path.result_type !== 'nesting') {
        continue
      }


      cur.value = prepareNestingValue(
        cur.target_md, target, cur.value, mut_refs_index, local_wanted
      )

      list[i] = cur
    }

    if (!countKeys(lst_wanted)) {
      break
    }

    if (countKeys(local_wanted) >= countKeys(lst_wanted)) {
      throw new Error('cant hold refs: ' + Object.keys(local_wanted))
    }

    lst_wanted = local_wanted
  }

}


export default function(md, dcl, value, data) {

  const mut_result = []
  const mut_refs_index = {}
  const mut_wanted_ref = {}

  if (!dcl.targeted_results_list) {
    unwrap(md, dcl.targeted_single_result, value, data, mut_refs_index, mut_wanted_ref, mut_result)
    completeValues(mut_result, mut_refs_index, mut_wanted_ref)
    return mut_result
  }

  if (value !== Object(value)) {
    throw new Error('return object from handler')
  }

  for (let i = 0; i < dcl.targeted_results_list.length; i++) {
    const cur = dcl.targeted_results_list[i]
    if (!value.hasOwnProperty(cur.result_name)) {
      continue
    }
    const cur_value = value[cur.result_name]
    if (cur_value === noopForPass) {
      continue
    }
    unwrap(md, cur, cur_value, data, mut_refs_index, mut_wanted_ref, mut_result)
  }

  completeValues(mut_result, mut_refs_index, mut_wanted_ref)

  return mut_result

}
