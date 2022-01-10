const stopUsingApiAsSource = (runtime) => {
  if (runtime.current_transaction == null) {
    return
  }

  runtime.current_transaction.source_api = null

}

export default stopUsingApiAsSource
