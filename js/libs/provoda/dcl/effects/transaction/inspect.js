const doesTransactionDisallowEffect = (current_transaction, self, effect) => {
  const source_api = current_transaction?.source_api
  if (source_api == null) {return false}

  const apis_names = effect.disallow_input_from_api == null
    ? effect.apis
    : effect.disallow_input_from_api

  if (apis_names === false) {
    return false
  }

  for (let i = 0; i < apis_names.length; i++) {
    const api = self.getInterface(apis_names[i])
    if (api == null) {continue}

    if (source_api.has(api)) {
      // source_api has api, so we cant execute effect
      return true
    }
  }

  return false
}

export { doesTransactionDisallowEffect }
