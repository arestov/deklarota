const _setRelReqState = (model, key, value) => {
  const {_highway} = model
  if (!_highway.__rel_request_states_by_name_by_id.has(key)) {
    _highway.__rel_request_states_by_name_by_id.set(key, new Map())
  }
  const storage = _highway.__rel_request_states_by_name_by_id.get(key)
  if (value == null) {
    storage.delete(model.getInstanceKey())
  } else {
    storage.set(model.getInstanceKey(), value)
  }

}

export default _setRelReqState
