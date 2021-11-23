
import Promise from '../common-libs/Promise-3.1.0.mod'

function extendPromise(promise, deferred) {
  promise.queued_promise = deferred.queued_promise

  promise.abort = function() {
    promise.aborted = true
    deferred.aborted = true


    if (!promise.sended && promise.queued_promise) {
      promise.queued_promise.asAbort()
    }

    if (deferred.queued) {
      deferred.queued.abort()
    }
    if (deferred.xhr) {
      deferred.xhr.abort()
    }
  }

  promise.setPrio = function() {
    if (deferred.queued) {
      deferred.queued.setPrio()
    } else if (deferred.setPrio) {
      deferred.setPrio()
    }
  }

  promise.done = promise.done || promise.then
  promise.fail = promise.fail || promise['catch']

  return promise
}

function toBigPromise(deferred) {
  const promise = new Promise(function(resolve, reject) {
    deferred.then(resolve, reject)
  })
  return extendPromise(promise, deferred)
}

extendPromise.toBigPromise = toBigPromise

export default extendPromise
