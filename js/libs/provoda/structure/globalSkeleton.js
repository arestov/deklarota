

import supportedAttrTargetAddr from '../Model/mentions/supportedAttrTargetAddr'
import MentionChain from '../Model/mentions/MentionChain'

import numDiff from '../Model/mentions/numDiff'
import addChainToIndex, { sortChainLinks } from '../Model/mentions/addChainToIndex'
import target_types from '../Model/mentions/target_types'
import uniqRelToMentionChain from '../dcl/nests/uniq/uniqRelToMentionChain'
import routesToMentionChains from '../dcl/routes/routesToMentionChains'

const TARGET_TYPE_ATTR = target_types.TARGET_TYPE_ATTR


function GlobalSkeleton() {
  /*
    contains
    1. declarations cache for specific app
    2. global relation chains
  */

  this.chains = []
  this.chains_by_rel = null
  this.chains_by_attr = null
  this.glue_rels = new Set()

  Object.seal(this)
}

function addUniqRelAttrCheck(global_skeleton, model) {
  uniqRelToMentionChain(global_skeleton.chains, model)
}

function addModel(global_skeleton, model, _ascent_level, _is_root) {

  addUniqRelAttrCheck(global_skeleton, model)
  routesToMentionChains(global_skeleton.chains, model)

  if (model.__attrs_uniq_external_deps == null || !model.__attrs_uniq_external_deps.length) {
    return
  }

  for (let i = 0; i < model.__attrs_uniq_external_deps.length; i++) {
    const cur = model.__attrs_uniq_external_deps[i]
    if (!supportedAttrTargetAddr(cur)) {
      continue
    }


    global_skeleton.chains.push(new MentionChain(
      TARGET_TYPE_ATTR,
      cur.nesting.path,
      model,
      cur,
      cur.as_string
    ))
  }



  // this.list_of_compx.push()
}



function buildRelsIndex(chains) {
  const result = {}
  for (let i = 0; i < chains.length; i++) {
    const cur = chains[i]

    addChainToIndex(result, cur)
  }

  for (const name in result) {
    if (!result.hasOwnProperty(name)) {
      continue
    }

    sortChainLinks(result, name)
  }

  return result
}

function buildAttrsIndex(chains) {
  const result = {}
  for (let i = 0; i < chains.length; i++) {
    const cur = chains[i]
    const attr = cur.addr.state.base
    if (!attr) {
      continue
    }

    result[attr] = result[attr] || []

    const last_step = cur.list[cur.list.length - 1]
    result[attr].push(last_step)
  }

  for (const name in result) {
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
