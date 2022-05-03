import { getAllGlueSources } from '../nest_compx/mentionsCandidates'
import { getAllGlueSources as getAllGlueSourcesAttrs } from '../attrs/comp/mentionsCandidates'

import prepareGlueSourceRuntime from './runtime/prepare'
import cachedField from '../cachedField'
import emptyArray from '../../emptyArray'

const provideGlueRels = cachedField(
  '__rel_all_glue_sources',
  ['_nest_by_type_listed', '__temp_connect_glue'],
  true,
  function provideGlueRels(_nest_by_type_listed, __temp_connect_glue, model) {
    const all_glue_sources = [
      ...(getAllGlueSources(model) || []),
      ...(getAllGlueSourcesAttrs(model) || []),
    ]

    if (!all_glue_sources.length) {
      return emptyArray
    }

    const uniq = new Map()
    for (let i = 0; i < all_glue_sources.length; i++) {
      const cur = all_glue_sources[i]
      uniq.set(cur.meta_relation, cur)
    }

    return [...uniq.values()].map(prepareGlueSourceRuntime)
  }
)

export default provideGlueRels
