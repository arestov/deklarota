import isGlueRoot from '../glue_rels/runtime/isGlueRoot'
import isGlueParent from '../glue_rels/runtime/isGlueParent'
import cachedField from '../cachedField'

const getAllPossibleRelMentionsCandidates = cachedField(
  '__rel_mentions_all_possible',
  ['_nest_by_type_listed'],
  true,
  function getAllPossibleRelMentionsCandidates(_nest_by_type_listed) {
    var compx_list = _nest_by_type_listed.comp
    if (compx_list == null) {
      return null
    }

    var result = []

    for (var i = 0; i < compx_list.length; i++) {
      var cur = compx_list[i]

      for (var jj = 0; jj < cur.parsed_deps.nest_watch.length; jj++) {
        var addr = cur.parsed_deps.nest_watch[jj]

        result.push({
          addr: addr,
          dest_name: cur.dest_name,
          final_rel_addr: cur.final_rel_addr,
          final_rel_key: cur.final_rel_key,
        })
      }
    }

    return result
  }
)

export const getAllGlueSources = cachedField(
  '__rel_glue_sources_all',
  ['_nest_by_type_listed'],
  true,
  function getAllGlueSources(_nest_by_type_listed) {
    var compx_list = _nest_by_type_listed.comp
    if (compx_list == null) {
      return null
    }

    var result = []

    for (var i = 0; i < compx_list.length; i++) {
      var cur = compx_list[i]
      result.push(...cur.glue_sources)
    }

    return result
  }
)


export const getParentRelMentions = cachedField(
  '__rel_mentions_parent',
  [],
  true,
  function getParentRelMentions(model) {
    var list = getAllGlueSources(model) || []

    var result = []

    for (var i = 0; i < list.length; i++) {
      var cur = list[i]
      if (!isGlueParent(cur.source)) {
        continue
      }

      result.push(cur)
    }

    return result
  }
)



export const getRootRelMentions = cachedField(
  '__rel_mentions_root',
  [],
  true,
  function getRootRelMentions(model) {
    var list = getAllGlueSources(model) || []

    var result = []

    for (var i = 0; i < list.length; i++) {
      var cur = list[i]
      if (!isGlueRoot(cur.source)) {
        continue
      }

      result.push(cur)
    }

    return result
  }
)


export default getAllPossibleRelMentionsCandidates
