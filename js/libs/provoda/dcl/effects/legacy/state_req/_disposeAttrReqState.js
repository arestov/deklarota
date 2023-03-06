const _disposeAttrReqState = (self) => {
  const store = self._highway.__attr_request_states_by_name_by_id
  for (const key of store.keys()) {
    store.get(key).delete(self.getInstanceKey())
  }
}

export default _disposeAttrReqState
