

import getCachedPVData from './getCachedPVData'
var getNodeInstanceCount = getCachedPVData.getNodeInstanceCount

var getAll = function(node) {
  var result = []
  var iteration_list = [ node ]
  var i = 0
  while(iteration_list.length) {
    var cur_node = iteration_list.shift()
    var node_type = cur_node.nodeType
    if (node_type == 1) {
      for (i = 0; i < cur_node.childNodes.length; i++) {
        iteration_list.push(cur_node.childNodes[i])
      }
      result.push(cur_node)
    } else if (node_type == 8) {
      result.push(cur_node)
    }

  }
  return result
}

var getAllCached = function(node) {
  if (node.__pv_all_nodes) {
    return node.__pv_all_nodes
  }

  var result = getAll(node)
  node.__pv_all_nodes = result
  return result
}

export default function buildClone(onode, struc_store, sample_id) {
  var cloned = onode.cloneNode(true)

  var all_onodes = getAllCached(onode)
  var all_cnodes = getAll(cloned)

  if (all_onodes.length !== all_cnodes.length) {
    throw new Error('something wrong')
  }

  for (var i = 0; i < all_onodes.length; i++) {
    all_cnodes[i].pvprsd = all_onodes[i].pvprsd
    all_cnodes[i].pvprsd_inst = getNodeInstanceCount(all_onodes[i].pvprsd, struc_store)
    all_cnodes[i].pv_sample_id = sample_id
  }

  return cloned
}
