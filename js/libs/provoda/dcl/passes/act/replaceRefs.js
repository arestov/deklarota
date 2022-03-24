import getRelFromInitParams from '../../../utils/getRelFromInitParams'
import getModelById from '../../../utils/getModelById'
import { doCopy } from '../../../../spv/cloneObj'

export const replaceRefs = function(md, init_data, mut_wanted_ref, mut_action_result) {
  if (init_data.use_ref_id) {
    if (mut_action_result.mut_refs_index[init_data.use_ref_id]) {
      return getModelById(md, mut_action_result.mut_refs_index[init_data.use_ref_id])
    }

    mut_wanted_ref[init_data.use_ref_id] = init_data.use_ref_id

    return init_data
  }


  const result = doCopy({}, init_data)
  const rels = getRelFromInitParams(init_data)
  if (rels) {
    result.rels = doCopy({}, rels)
  }

  for (const nesting_name in rels) {
    if (!rels.hasOwnProperty(nesting_name)) {
      continue
    }
    const cur = rels[nesting_name]
    if (!Array.isArray(cur)) {
      result.rels[nesting_name] = replaceRefs(md, cur, mut_wanted_ref, mut_action_result)
      continue
    }

    const list = []
    for (let i = 0; i < cur.length; i++) {
      list.push(replaceRefs(md, cur[i], mut_wanted_ref, mut_action_result))
    }
  }

  return result
}
