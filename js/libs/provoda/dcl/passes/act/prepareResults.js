
import getTargetModels from './getTargetModels'
import prepareNestingValue from './prepareNestingValue'
import spv from '../../../../spv'
import noopForPass from '../noop'
import MutActionResult from './MutActionResult'
import { useRefIfNeeded } from './useRefIfNeeded'
const countKeys = spv.countKeys

const isRedirectAction = function(target) {
  return Boolean(target.options && target.options.action)
}

const prepareAndHold = function(md, target, value) {
  const multi_path = target.target_path

  if (!md) {
    throw new Error('empty prepareAndHold md')
  }

  switch (multi_path.result_type) {
    case 'nesting': {
      return {
        target: target,
        target_md: md,
        value: value,
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

const unwrap = function(md, target, value, data, mut_action_result) {
  if (isRedirectAction(target)) {
    const models = getTargetModels(md, target, data)
    if (!Array.isArray(models)) {
      if (!models) {
        throw new Error('empty models of unwrap')
      }

      mut_action_result.mut_result.push({
        target: target,
        target_md: models,
        value: useRefIfNeeded(target, md, getProperDestValue(target, value, 0), mut_action_result)
      })
      return
    }

    for (let i = 0; i < models.length; i++) {
      const cur = models[i]
      if (!cur) {
        throw new Error('empty cur of unwrap')
      }
      mut_action_result.mut_result.push({
        target: target,
        target_md: cur,
        value: useRefIfNeeded(target, md, getProperDestValue(target, value, i), mut_action_result)
      })
    }
    return
  }

  if (target.path_type == 'by_provoda_id') {
    mut_action_result.mut_result.push({target: target, md: md, value: value, data: data})
    return
  }

  const models = getTargetModels(md, target, data)

  if (value && target.options && target.options.map_values_list_to_target) {
    if (value.length !== models.length) {
      throw new Error('values list length should match target list length')
    }
  }

  if (Array.isArray(models)) {
    for (let i = 0; i < models.length; i++) {
      const cur = models[i]
      mut_action_result.mut_result.push(
        prepareAndHold(cur, target, getProperDestValue(target, value, i))
      )
    }
  } else {
    mut_action_result.mut_result.push(
      prepareAndHold(models, target, getProperDestValue(target, value, null))
    )
  }

}

const completeValues = function(mut_action_result) {
  let lst_wanted = mut_action_result.mut_wanted_ref

  while (true) {
    const local_wanted = {}

    for (let i = 0; i < mut_action_result.mut_result.length; i++) {
      const cur = mut_action_result.mut_result[i]
      const target = cur.target
      if (isRedirectAction(target)) {
        continue
      }
      const multi_path = target.target_path
      if (multi_path.result_type !== 'nesting') {
        continue
      }


      cur.value = prepareNestingValue(
        cur.target_md, target, cur.value, mut_action_result, local_wanted
      )

      mut_action_result.mut_result[i] = cur
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
  const mut_action_result = new MutActionResult()

  if (!dcl.targeted_results_list) {
    unwrap(md, dcl.targeted_single_result, value, data, mut_action_result)
    completeValues(mut_action_result)
    return mut_action_result.mut_result
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
    unwrap(md, cur, cur_value, data, mut_action_result)
  }

  completeValues(mut_action_result)

  return mut_action_result.mut_result

}
