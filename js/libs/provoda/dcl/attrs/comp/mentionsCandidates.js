import isGlueRoot from '../../glue_rels/runtime/isGlueRoot'
import isGlueParent from '../../glue_rels/runtime/isGlueParent'
import cachedField from '../../cachedField'

const checkSourceRoot = function(addr) {
  return isGlueRoot(addr.source)
}

const checkSourceParent = function(addr) {
  return isGlueParent(addr.source)
}

export const getAllGlueSources = cachedField(
  '__rel_glue_sources_all_of_attrs',
  ['__temp_connect_glue'],
  true,
  function getAllGlueSources(list) {
    return list
  }
)

export const getRootRelMentions = cachedField(
  '__rel_mentions_root_of_attrs',
  [],
  true,
  function getRootRelMentions(model) {
    const list = getAllGlueSources(model)
    if (list == null || !list.length) {
      return
    }

    const result = list.filter(checkSourceRoot)

    return result

  }
)

export const getParentRelMentions = cachedField(
  '__rel_mentions_parent_of_attrs',
  [],
  true,
  function getRootRelMentions(model) {
    const list = getAllGlueSources(model)
    if (list == null || !list.length) {
      return
    }

    const result = list.filter(checkSourceParent)

    return result

  }
)
