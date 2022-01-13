function getCurrentTransactionKey(self) {
  const id = self._currentMotivator()?.complex_order[0]
  if (id) {
    return id
  }
  throw new Error('no id for transaction')
}

export default getCurrentTransactionKey
