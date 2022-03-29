import { countKeys } from '../../../../spv'
import { doCopy } from '../../../../spv/cloneObj'
import pushToRoute from '../../../structure/pushToRoute'
import get_constr from '../../../structure/get_constr'

import { replaceRefs } from './replaceRefs'
import { needsRefs } from './needsRefs'
import { isOk } from './isOk'

const getNestingConstr = get_constr.getNestingConstr

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

export const initItem = function(md, target, raw_value, mut_action_result) {
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

    if (countKeys(local_wanted)) {
      doCopy(mut_action_result.mut_wanted_ref, local_wanted)
      return value
    }
  }

  const multi_path = target.target_path
  const nesting_name = multi_path.nesting.target_nest_name

  if (!target.options.can_create) {
    throw new Error('add `can_create` to options to create model instance in rel')
  }

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
