define(function(require) {
'use strict'

var supportedAttrTargetAddr = require('../Model/mentions/supportedAttrTargetAddr')
var supportedRelTargetAddr = require('../Model/mentions/supportedRelTargetAddr')
var numDiff = require('../Model/mentions/numDiff')
var target_types = require('../Model/mentions/target_types')
var TARGET_TYPE_ATTR = target_types.TARGET_TYPE_ATTR
var TARGET_TYPE_REL = target_types.TARGET_TYPE_REL

function addrToLinks(addr, chain) {
  var list = []

  for (var i = 0; i < addr.nesting.path.length; i++) {
    var rel = addr.nesting.path[i]
    list.push(new ChainLink(chain, i, rel))
  }

  return list
}

function ChainLink(chain, num, rel) {
  this.chain = chain
  this.num = num
  this.rel = rel
}

function Chain(target, target_type, addr, target_name) {
  this.target_mc = target
  this.target_type = target_type
  this.addr = addr
  this.list = addrToLinks(addr, this)
  this.target_name = target_name || ''
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

function addCompxNestForModel(global_skeleton, model) {
  if (model._nest_by_type_listed == null) {
    return
  }

  var compx_list = model._nest_by_type_listed.compx
  if (compx_list == null) {
    return
  }

  for (var i = 0; i < compx_list.length; i++) {
    var cur = compx_list[i]
    for (var jj = 0; jj < cur.parsed_deps.nest_watch.length; jj++) {
      var addr = cur.parsed_deps.nest_watch[jj]
      if (!supportedRelTargetAddr(addr)) {
        continue
      }

      global_skeleton.chains.push(new Chain(model, TARGET_TYPE_REL, addr, cur.dest_name))
    }
  }

}

function addModel(global_skeleton, model) {
  addCompxNestForModel(global_skeleton, model)

  if (model.__attrs_uniq_external_deps == null || !model.__attrs_uniq_external_deps.length) {
    return
  }

  for (var i = 0; i < model.__attrs_uniq_external_deps.length; i++) {
    var cur = model.__attrs_uniq_external_deps[i]
    if (!supportedAttrTargetAddr(cur)) {
      continue
    }

    global_skeleton.chains.push(new Chain(model, TARGET_TYPE_ATTR, cur))
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

  for (var name in result) {
    if (!result.hasOwnProperty(name)) {
      continue
    }

    result[name] = result[name].sort(numDiff)
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

  for (var name in result) {
    if (!result.hasOwnProperty(name)) {
      continue
    }

    result[name] = result[name].sort(numDiff)
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
