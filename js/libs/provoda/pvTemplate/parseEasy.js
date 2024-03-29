
import getCachedPVData from './getCachedPVData'
import patchNode from './patchNode'

function getCommentPVData(cur_node, struc_store, getSample) {
  return getCachedPVData(cur_node, struc_store, true, getSample)
}

function getPVData(cur_node, struc_store, getSample) {
  return getCachedPVData(cur_node, struc_store, false, getSample)
}

const patchTillCanPatch = (node, struc_store, getSample) => {
  let node_to_patch = node
  let last_patched = null
  while (node_to_patch) {
    if (node_to_patch.nodeType != 1 && node_to_patch.nodeType != 8) {
      return last_patched
    }
    const directives_data = getPVData(node_to_patch, struc_store, getSample)
    const patched = patchNode(node_to_patch, struc_store, directives_data, getSample, null)

    if (!patched) {
      return last_patched
    }
    last_patched = patched
    node_to_patch = patched
  }
}

export default function parserEasy(start_node, vroot_node, struc_store, getSample) {
  //полный парсинг, байндинг одного scope (раньше и парсинг был только в пределах одного scope)
  const list_for_binding = []
  const match_stack = [ start_node, true ]

  while (match_stack.length) {
    const cur_node = match_stack.shift()
    const can_bind = match_stack.shift()
    const node_type = cur_node.nodeType
    let directives_data = null
    const is_start_node = cur_node === start_node

    if (node_type == 1) {
      let i = 0
      const is_root_node = vroot_node === cur_node
      directives_data = getPVData(cur_node, struc_store, getSample)

      const can_bind_children = (!directives_data.new_scope_generator || is_root_node)

      // if (directives_data.replacer) {
      // 	match_stack.unshift(directives_data.node);
      // } else {
      for (i = 0; i < cur_node.childNodes.length; i++) {
          // если запрещен байндинг текущего нода, то и его потомков тоже запрещён
        match_stack.push(cur_node.childNodes[i], can_bind && can_bind_children)
      }
      if (can_bind) {
        list_for_binding.push(is_root_node, cur_node, directives_data)
      }
      // }
    } else if (node_type == 8) {
      directives_data = getCommentPVData(cur_node, struc_store, getSample)
      // if (directives_data.replacer) {
        // match_stack.unshift(directives_data.node, can_bind);
      // } else
      if (can_bind) {
        list_for_binding.push(false, cur_node, directives_data)
      }
    }
    const patched = !is_start_node && patchTillCanPatch(cur_node, struc_store, getSample)
    if (patched) {
      match_stack.unshift(patched, can_bind)
    }
  }
  return list_for_binding
}
