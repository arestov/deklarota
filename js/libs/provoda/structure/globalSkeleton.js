define(function() {
'use strict'

function ChainLink(chain, num, rel) {
  this.chain = chain
  this.num = num
  this.rel = rel
}

function Chain(target, addr) {
  this.target_mc = target
  this.addr = addr
  this.list = []
  for (var i = 0; i < addr.nesting.path.length; i++) {
    var rel = addr.nesting.path[i]
    this.list.push(new ChainLink(this, i, rel))
  }

}

function GlobalSkeleton() {
  /*
    contains
    1. declarations cache for specific app
    2. global relation chains
  */

  this.chains = []
  this.chains_by_rel = null
  this.chains_by_attr = null

  Object.seal(this)
}

function supportedAddr(addr) {
  if (addr.base_itself) {
    return false
  }
  return addr.result_type == "nesting" || addr.nesting.path
}

function addModel(global_skeleton, model) {
  if (model.__attrs_uniq_external_deps == null || !model.__attrs_uniq_external_deps.length) {
    return
  }

  for (var i = 0; i < model.__attrs_uniq_external_deps.length; i++) {
    var cur = model.__attrs_uniq_external_deps[i]
    if (!supportedAddr(cur)) {
      continue
    }

    global_skeleton.chains.push(new Chain(model, cur))
  }



  // this.list_of_compx.push()
}


function buildRelsIndex(chains) {
  var result = {}
  for (var i = 0; i < chains.length; i++) {
    var cur = chains[i]

    for (var jj = 0; jj < cur.list.length; jj++) {
      var step = cur.list[jj]
      // make index for each step
      result[step.rel] = result[step.rel] || []
      result[step.rel].push(step)
    }
  }

  return result
}

function buildAttrsIndex(chains) {
  var result = {}
  for (var i = 0; i < chains.length; i++) {
    var cur = chains[i]
    var attr = cur.addr.state.base
    if (!attr) {
      continue
    }

    result[attr] = result[attr] || []

    var last_step = cur.list[cur.list.length - 1]
    result[attr].push(last_step)
  }

  return result
}


function complete(global_skeleton) {
  global_skeleton.chains_by_rel = buildRelsIndex(global_skeleton.chains)
  global_skeleton.chains_by_attr = buildAttrsIndex(global_skeleton.chains)
}


return {
  GlobalSkeleton: GlobalSkeleton,
  addModel: addModel,
  complete: complete,
}
})
