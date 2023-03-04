
const _getInterface = (model, api_name) => {
  return model._highway.interfaces_by_name_by_node_id.get(api_name)?.get(model.getInstanceKey())
}

export default _getInterface
