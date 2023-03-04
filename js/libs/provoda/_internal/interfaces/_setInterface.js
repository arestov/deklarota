const _setInterface = (model, api_name, value) => {
  const {_highway} = model
  if (!_highway.interfaces_by_name_by_node_id.has(api_name)) {
    _highway.interfaces_by_name_by_node_id.set(api_name, new Map())
  }
  const storage = _highway.interfaces_by_name_by_node_id.get(api_name)
  if (value == null) {
    storage.delete(model.getInstanceKey())
  } else {
    storage.set(model.getInstanceKey(), value)
  }

}

export default _setInterface
