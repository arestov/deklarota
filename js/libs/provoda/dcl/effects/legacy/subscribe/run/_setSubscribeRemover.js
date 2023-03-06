const _setSubscribeRemover = (model, key, value) => {
  const {_highway} = model
  if (!_highway.__interfaces_to_subscribers_removers_by_name_by_node_id.has(key)) {
    _highway.__interfaces_to_subscribers_removers_by_name_by_node_id.set(key, new Map())
  }
  const storage = _highway.__interfaces_to_subscribers_removers_by_name_by_node_id.get(key)
  if (value == null) {
    storage.delete(model.getInstanceKey())
  } else {
    storage.set(model.getInstanceKey(), value)
  }

}

export default _setSubscribeRemover
