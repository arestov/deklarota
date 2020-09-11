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

    return all_glue_sources.map(prepareGlueSourceRuntime)
  }
)

export default provideGlueRels
