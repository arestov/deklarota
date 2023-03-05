const _getSubscribeRemover = (model, key) => {
  return model._highway
    .__interfaces_to_subscribers_removers_by_name_by_node_id
    .get(key)
    ?.get(model.getInstanceKey())
}

export default _getSubscribeRemover
