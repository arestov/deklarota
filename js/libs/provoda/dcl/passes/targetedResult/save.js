

import _updateAttr from '../../../_internal/_updateAttr'
import getModelById from '../../../utils/getModelById'
import getRelFromInitParams from '../../../utils/getRelFromInitParams'
import _updateRel from '../../../_internal/_updateRel'
import prepareResults from '../act/prepareResults'
import act from '../act'


const saveToDestModel = function(current_motivator, exec_item) {
  if (!current_motivator) {
    throw new Error('should be current_motivator')
  }
  // md, target, value
  const target_md = exec_item.target_md
  const value = exec_item.value
  const target = exec_item.target

  const multi_path = target.target_path

  if (target.options && target.options.action) {
    act(target_md, target.options.action, value)
    return
  }

  switch (multi_path.result_type) {
    case 'nesting': {
      _updateRel(
        target_md,
        multi_path.nesting.target_nest_name,
        value
      )
      return
    }
    case 'state': {
      _updateAttr(target_md, multi_path.state.base, value)
    }
  }
}

const saveByProvodaId = function(current_motivator, md, _target, wrap) {
  if (!current_motivator) {
    throw new Error('should be current_motivator')
  }

  for (const id in wrap) {
    if (!wrap.hasOwnProperty(id)) {
      continue
    }
    const data = wrap[id]
    const model = getModelById(md, id)
    const states = data.states
    const rels = getRelFromInitParams(data)

    for (const state in states) {
      if (!states.hasOwnProperty(state)) {
        continue
      }
      _updateAttr(model, state, states[state])
    }

    for (const nesting in rels) {
      if (!rels.hasOwnProperty(nesting)) {
        continue
      }
      _updateRel(model, nesting, rels[nesting])
    }
  }


}


const saveResultToTarget = function(current_motivator, exec_item) {
  const target = exec_item.target
  if (target.path_type == 'by_provoda_id') {
    saveByProvodaId(current_motivator, exec_item.md, target, exec_item.value)
    return
  }

  saveToDestModel(current_motivator, exec_item)
}

const saveResult = function(md, dcl, value, data) {
  const current_motivator = md._currentMotivator()

  const semi_result = prepareResults(md, dcl, value, data)

  for (let i = 0; i < semi_result.length; i++) {
    saveResultToTarget(current_motivator, semi_result[i])
  }
}

export default saveResult
