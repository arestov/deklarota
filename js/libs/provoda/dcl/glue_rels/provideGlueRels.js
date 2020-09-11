import { getAllGlueSources } from '../nest_compx/mentionsCandidates'
import prepareGlueSourceRuntime from './runtime/prepare'
import cachedField from '../cachedField'
const emptyArray = Object.freeze([])

const provideGlueRels = cachedField(
  '__rel_all_glue_sources',
  ['_nest_by_type_listed'],
  true,
  function provideGlueRels(_nest_by_type_listed, model) {
    var all_glue_sources = getAllGlueSources(model) || []
    if (!all_glue_sources.length) {
      return emptyArray
    }

    const uniq = new Map()
    for (var i = 0; i < all_glue_sources.length; i++) {
      const cur = all_glue_sources[i]
      uniq.set(cur.meta_relation, cur)
    }

    return [...uniq.values()].map(prepareGlueSourceRuntime)
  }
)

export default provideGlueRels
