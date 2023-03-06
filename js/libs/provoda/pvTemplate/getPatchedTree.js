
import spv from '../../spv'
import getCachedPVData from './getCachedPVData'
import patchNode from './patchNode'
import buildClone from './buildClone'
import directives_parsers from './directives_parsers'
const cloneObj = spv.cloneObj
const unsetStrucKey = getCachedPVData.unsetStrucKey
const setStrucKey = getCachedPVData.setStrucKey
const scope_generators_p = directives_parsers.scope_generators_p


function getCommentPVData(cur_node, struc_store, getSample) {
  return getCachedPVData(cur_node, struc_store, true, getSample)
}

function getPVData(cur_node, struc_store, getSample) {
  return getCachedPVData(cur_node, struc_store, false, getSample)
}

const createPvNest = scope_generators_p['pv-rel']

const getMarkedPvNest = function(node, pv_nest, struc_store, getSample) {
  if (!pv_nest) {
    return node
  }

  const directives_data = cloneObj({}, getPVData(node, struc_store, getSample))

  if (directives_data.instructions['pv-rel']) {
    throw new Error('pv-import and sample itself could not be both marked as pv-rel')
  }


  directives_data.instructions = cloneObj({}, directives_data.instructions)
  directives_data.instructions['pv-rel'] = createPvNest(node, pv_nest)
  directives_data.new_scope_generator = true

  const result = unsetStrucKey(node)
  setStrucKey(node, struc_store, directives_data)

  return result
}

export default function getPatchedTree(original_node, struc_store, getSample, opts, sample_id) {
  const node = getMarkedPvNest(
    buildClone(original_node, struc_store, sample_id),
    opts && opts.pv_nest,
    struc_store,
    getSample
  )

  // var result = [];

  const match_stack = [ node ]
  let i = 0
  while (match_stack.length) {
    const cur_node = match_stack.shift()
    const is_start_node = node === cur_node
    const node_type = cur_node.nodeType
    let directives_data = null
    if (node_type == 1) {
      directives_data = getPVData(cur_node, struc_store, getSample)
      // result.push(cur_node, directives_data);
    } else if (node_type == 8) {
      directives_data = getCommentPVData(cur_node, struc_store, getSample)
      // result.push(cur_node, directives_data);
    }

    const patched = !is_start_node && patchNode(cur_node, struc_store, directives_data, getSample, opts)
    if (patched) {
      match_stack.unshift(patched)
    }


    // if (directives_data.replacer) {
    // 	match_stack.unshift(directives_data.node);
    // }

    if (node_type == 1) {
      for (i = 0; i < cur_node.childNodes.length; i++) {
        match_stack.push(cur_node.childNodes[i])
      }
    }

  }
  // return result;
  return node
}
