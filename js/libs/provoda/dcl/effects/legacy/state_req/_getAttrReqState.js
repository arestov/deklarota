const _getAttrReqState = (model, key) => {
  return model._highway
    .__attr_request_states_by_name_by_id
    .get(key)
    ?.get(model.getInstanceKey())
}

export default _getAttrReqState
