

import supportedAttrTargetAddr from '../Model/mentions/supportedAttrTargetAddr'
import supportedRelTargetAddr from '../Model/mentions/supportedRelTargetAddr'
import getAllPossibleRelMentionsCandidates, { getRootRelMentions } from '../dcl/nest_compx/mentionsCandidates'

import numDiff from '../Model/mentions/numDiff'
import target_types from '../Model/mentions/target_types'

var TARGET_TYPE_ATTR = target_types.TARGET_TYPE_ATTR
var TARGET_TYPE_REL = target_types.TARGET_TYPE_REL
var TARGET_TYPE_GLUE_REL = target_types.TARGET_TYPE_GLUE_REL

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

function handleCompRels(global_skeleton, model) {
  var all_deps = getAllPossibleRelMentionsCandidates(model)
  if (all_deps == null) {
    return
  }

  for (var i = 0; i < all_deps.length; i++) {
    var candidate = all_deps[i]
    if (!supportedRelTargetAddr(candidate.addr)) {
      continue
    }

    global_skeleton.chains.push(new Chain(model, TARGET_TYPE_REL, candidate.addr, candidate.dest_name))
  }
}

const iterateMentions = function iterateMentions(iterateFn) {
  return function iterate(model) {
    var full_list = []
    full_list.push(...iterateFn(model))
    for (var chi in model._all_chi) {
      if (!model._all_chi.hasOwnProperty(chi) || model._all_chi[chi] == null) {
        continue
      }
      full_list.push(...iterate(model._all_chi[chi].prototype))
    }

    if (!full_list.length) {
      return full_list
    }

    var result = new Map()
    for (var i = 0; i < full_list.length; i++) {
      var cur = full_list[i]
      var key = cur.meta_relation
      if (result.has(key)) {
        continue
      }

      result.set(key, cur)
    }

    return [...result.values()]
  }
}

const getAllRootMentions = iterateMentions(getRootRelMentions)

function handleGlueRels(global_skeleton, model, ascent_level, is_root) {
  if (!is_root) {
    return
  }
  var root_mentions = getAllRootMentions(model)

  for (var i = 0; i < root_mentions.length; i++) {
    var candidate = root_mentions[i]
    global_skeleton.chains.push(new Chain(
      model, TARGET_TYPE_GLUE_REL, candidate.final_rel_addr, candidate.final_rel_key
    ))
  }
}

function addCompxNestForModel(global_skeleton, model, ascent_level, is_root) {
  handleCompRels(global_skeleton, model)
  handleGlueRels(global_skeleton, model, ascent_level, is_root)
}

function addModel(global_skeleton, model, ascent_level, is_root) {
  addCompxNestForModel(global_skeleton, model, ascent_level, is_root)

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


export default {
  GlobalSkeleton: GlobalSkeleton,
  addModel: addModel,
  complete: complete,
}
