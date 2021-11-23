const bindRuntimeError = (runtime, emitOnError) => {
  runtime.last_error = null

  let gotError

  const makePromiseToReject = () => {
    const lastError = new Promise((_resolve, reject) => {
      gotError = reject
    })


    runtime.last_error = lastError
  }

  makePromiseToReject()

  const handle = (error) => {
    console.error(error)

    const lastGotError = gotError
    // we don't want new errors be pushed in same last_error during error handling
    // so let's put new promise in last_error
    makePromiseToReject()

    // send current error to old promise (since we replaced last_error/gotError)
    lastGotError(error)

    // send error to 'runtimeOpts.onError'
    if (emitOnError) {
      emitOnError(error)
    }
  }

  return handle

}

export default bindRuntimeError
