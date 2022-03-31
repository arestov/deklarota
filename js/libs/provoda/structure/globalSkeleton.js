

import supportedAttrTargetAddr from '../Model/mentions/supportedAttrTargetAddr'
import supportedRelTargetAddr from '../Model/mentions/supportedRelTargetAddr'
import getAllPossibleRelMentionsCandidates, {
  getRootRelMentions, getParentRelMentions,
  getAllGlueSources,
} from '../dcl/nest_compx/mentionsCandidates'
import {
  getRootRelMentions as getRootRelMentionsAttrs,
  getParentRelMentions as getParentRelMentionsAttrs,
  getAllGlueSources as getAllGlueSourcesAttrs,
} from '../dcl/attrs/comp/mentionsCandidates'
import MentionChain from '../Model/mentions/MentionChain'

import numDiff from '../Model/mentions/numDiff'
import addChainToIndex, { sortChainLinks } from '../Model/mentions/addChainToIndex'
import target_types from '../Model/mentions/target_types'
import provideGlueRels from '../dcl/glue_rels/provideGlueRels'
import uniqRelToMentionChain from '../dcl/nests/uniq/uniqRelToMentionChain'
import routesToMentionChains from '../dcl/routes/routesToMentionChains'

const TARGET_TYPE_ATTR = target_types.TARGET_TYPE_ATTR
const TARGET_TYPE_GLUE_REL = target_types.TARGET_TYPE_GLUE_REL


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

function handleCompRels(_global_skeleton, model) {
  const all_deps = getAllPossibleRelMentionsCandidates(model)
  if (all_deps == null) {
    return
  }

  for (let i = 0; i < all_deps.length; i++) {
    const candidate = all_deps[i]
    if (!supportedRelTargetAddr(candidate.addr)) {
      continue
    }

  }
}

function markGlueRels(global_skeleton, model) {
  const list = [
    ...(getAllGlueSources(model) || []),
    ...(getAllGlueSourcesAttrs(model) || [])

  ]
  if (list == null) {return}
  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    global_skeleton.glue_rels.add(cur.meta_relation)
    global_skeleton.glue_rels.add(cur.final_rel_key)
  }
}

const iterateMentions = function iterateMentions(iterateFn) {
  return function iterate(model, level) {
    const full_list = []
    full_list.push(...iterateFn(model, level))
    for (const chi in model._all_chi) {
      if (!model._all_chi.hasOwnProperty(chi) || model._all_chi[chi] == null) {
        continue
      }
      full_list.push(...iterate(model._all_chi[chi].prototype, level + 1))
    }

    if (!full_list.length) {
      return full_list
    }

    const result = new Map()
    for (let i = 0; i < full_list.length; i++) {
      const cur = full_list[i]
      const key = cur.final_rel_key
      if (result.has(key)) {
        continue
      }

      result.set(key, cur)
    }

    return [...result.values()]
  }
}



const getAllRootMentions = iterateMentions(function(model) {
  return [
    ...(getRootRelMentions(model) || []),
    ...(getRootRelMentionsAttrs(model) || []),
  ]
})

const getAllParentMentions = iterateMentions(function(model, level) {
  const list = level ? [
    ...(getParentRelMentions(model) || []),
    ...(getParentRelMentionsAttrs(model) || []),
  ] : []
  if (!list.length) {
    return list
  }

  return list.filter(function(item) {
    return (level - item.source.from_base.steps) == 0
  })
})


function handleGlueParentAscent(global_skeleton, model) {
  const list = getAllParentMentions(model, 0)

  for (let i = 0; i < list.length; i++) {
    const candidate = list[i]
    global_skeleton.chains.push(new MentionChain(
      TARGET_TYPE_GLUE_REL,
      candidate.final_rel_addr.nesting.path,
      model,
      candidate.final_rel_addr,
      candidate.final_rel_key
    ))
  }
}

function handleGlueRels(global_skeleton, model, ascent_level, is_root) {
  markGlueRels(global_skeleton, model)
  handleGlueParentAscent(global_skeleton, model, ascent_level)

  if (!is_root) {
    return
  }
  const root_mentions = getAllRootMentions(model, 0)

  for (let i = 0; i < root_mentions.length; i++) {
    const candidate = root_mentions[i]
    global_skeleton.chains.push(new MentionChain(
      TARGET_TYPE_GLUE_REL,
      candidate.final_rel_addr.nesting.path,
      model,
      candidate.final_rel_addr,
      candidate.final_rel_key
    ))
  }
}

function addCompxNestForModel(global_skeleton, model, ascent_level, is_root) {
  handleCompRels(global_skeleton, model)
  handleGlueRels(global_skeleton, model, ascent_level, is_root)
}

function addUniqRelAttrCheck(global_skeleton, model) {
  uniqRelToMentionChain(global_skeleton.chains, model)
}

function addModel(global_skeleton, model, ascent_level, is_root) {
  provideGlueRels(model)
  addCompxNestForModel(global_skeleton, model, ascent_level, is_root)

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
