
var Promise = require('Promise')
var spv = require('spv')
var getApiPart = require('./getApiPart')
var getTargetField = spv.getTargetField
var countKeys = spv.countKeys

function ensureDeferred(collected) {
  if (collected.deffered) {
    return collected.deffered
  }

  collected.deffered = new Promise(function(resolve, reject) {
    collected.resolve = resolve
    collected.reject = reject
  })

  return collected.deffered
}

function CollectedTemplate(send_declr) {
  this.ids = {}
  this.send_declr = send_declr
  this.deffered = null
  this.resolve = null
  this.reject = null
}


function doBatch(reqs_batching, send_declr, id) {
  if (!reqs_batching.collected[send_declr.id]) {
    reqs_batching.collected[send_declr.id] = new CollectedTemplate(send_declr)
  }

  var colleted = reqs_batching.collected[send_declr.id]

  if (!colleted.ids[id]) {
    colleted.ids[id] = ensureDeferred(colleted).then(function(index) {
      return index[id]
    })
  }

  return colleted.ids[id]
}


function BatchingTemplate() {
  this.keys = {}
  this.is_processing = false
  this.collected = {}
}

function batch(md, num) {
  if (!md._highway.reqs_batching) {
    md._highway.reqs_batching = new BatchingTemplate()
  }

  var batching = md._highway.reqs_batching
  batching.keys[num] = true
  batching.is_processing = true
}

function releaseBatch(md, num) {
  var batching = md._highway.reqs_batching
  batching.keys[num] = false
  batching.is_processing = countKeys(batching.keys, true)
  if (!batching.is_processing) {
    finalizeBatch(batching, md)
  }
}

function bindToMakeIndex(send_declr) {
  return function(arr) {
    var index = {}
    for (var i = 0; i < arr.length; i++) {
      index[getTargetField(arr[i], send_declr.ids_declr.indexBy)] = arr[i]
    }
    return index
  }
}

function finalizeCollected(collected, md) {
  if (!collected.deffered) {
    return
  }

  var send_declr = collected.send_declr
  var req = send_declr.ids_declr.req.call(null, getApiPart(send_declr, md), Object.keys(collected.ids))
    .then(bindToMakeIndex(send_declr))

  var deffered = collected.deffered
  req.then(function() {
    if (collected.deffered !== deffered) {
      return
    }
    collected.ids = {}
    collected.effered = null
    collected.resolve = null
    collected.reject = null
  })

  req.then(collected.resolve, collected.reject)


}

function finalizeBatch(reqs_batching, md) {
  for (var send_declr_id in reqs_batching.collected) {
    finalizeCollected(reqs_batching.collected[send_declr_id], md)
    reqs_batching.collected[send_declr_id] = null
  }
}

export default {
  doBatch: doBatch,
  batch: batch,
  releaseBatch: releaseBatch,
}
