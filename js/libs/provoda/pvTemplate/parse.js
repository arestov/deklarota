
import getCachedPVData from './getCachedPVData'

function getCommentPVData(cur_node, struc_store, getSample) {
  return getCachedPVData(cur_node, struc_store, true, getSample)
}

function getPVData(cur_node, struc_store, getSample) {
  return getCachedPVData(cur_node, struc_store, false, getSample)
}

export default function parse(start_node, struc_store, getSample, _opts) {
  //полный парсинг, без байндинга

  const result = []

  const match_stack = [ start_node ]
  let i = 0
  while (match_stack.length) {
    const cur_node = match_stack.shift()
    const node_type = cur_node.nodeType
    let directives_data = null
    if (node_type == 1) {
      directives_data = getPVData(cur_node, struc_store, getSample)
      result.push(cur_node, directives_data)
    } else if (node_type == 8) {
      directives_data = getCommentPVData(cur_node, struc_store, getSample)
      result.push(cur_node, directives_data)
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
  return result
}
