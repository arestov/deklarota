import getRelPathConstrs from '../nests/getRelPathConstrs'

const validateActionTarget = (self, target) => {
  if (target.target_path.result_type != 'nesting') {
    return
  }

  const rel_constr = getRelPathConstrs(self, target.target_path.nesting.path, false)


  // debugger
}

const validateActionsDestinations = (Root, self) => {
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
        validateActionTarget(self, cur.targeted_results_list[i])
      }
    }

    if (cur.targeted_single_result) {
      validateActionTarget(self, cur.targeted_single_result)
    }


  }

  // debugger
}

export default validateActionsDestinations
