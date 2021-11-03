import getRelShape from '../nests/getRelShape'
import getPrtsByRelPath, { getRelConstrByRelLinking } from '../nests/getPrtsByRelPath'
import getBasePrtByAddr from '../nests/getBasePrtByAddr'

const throwError = (msg, item, context) => {
  const err = new Error(msg)
  console.error(err.message, context, item.__code_path)
  throw err
}

const baseArgNestingStage = (prt, target_options, action) => {
  if (!target_options?.base) {
    return prt
  }

  const rel_shape = action.rel_shape || getRelShape(prt, action.rel_name)

  if (!rel_shape) {
    throwError('can\'t get rel_shape for action', prt, {action})
  }

  return getRelConstrByRelLinking(prt, rel_shape.constr_linking)
}

const oneBase = (self, target) => {
  const addr = target.target_path

  const base = getBasePrtByAddr(self, addr)
  return getPrtsByRelPath(
    base,
    addr.nesting.path,
    false
  )
}

const validateActionTarget = (self, target, action) => {
  if (target.target_path.result_type != 'nesting') {
    return
  }

  const arg_nesting_base = baseArgNestingStage(self, target.options, action)

  if (!Array.isArray(arg_nesting_base)) {
    oneBase(arg_nesting_base, target)
    return
  }

  for (var i = 0; i < arg_nesting_base.length; i++) {
    oneBase(arg_nesting_base[i], target)
  }



  // debugger
}

const validateActionsDestinations = (Root, self) => {
  if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
    return
  }

  const actions = self._extendable_passes_index
  if (!actions) {
    return
  }


  for (const name in actions) {
    if (!actions.hasOwnProperty(name)) {
      continue
    }

    const cur = actions[name]

    if (cur.targeted_results_list) {
      for (var i = 0; i < cur.targeted_results_list.length; i++) {
        validateActionTarget(self, cur.targeted_results_list[i], cur)
      }
    }

    if (cur.targeted_single_result) {
      validateActionTarget(self, cur.targeted_single_result, cur)
    }


  }

  // debugger
}

export default validateActionsDestinations
