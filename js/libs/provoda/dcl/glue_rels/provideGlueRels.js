import prepareGlueSourceRuntime from './runtime/prepare'
import cachedField from '../cachedField'
const emptyArray = Object.freeze([])

const provideGlueRels = cachedField(
  '__rel_all_glue_sources',
  ['_nest_by_type_listed'],
  true,
  function provideGlueRels(_nest_by_type_listed) {
    var comp_rels = _nest_by_type_listed && _nest_by_type_listed.comp
    if (!comp_rels || !comp_rels.length) {
      return emptyArray
    }

    var all_glue_sources = []

    for (var i = 0; i < comp_rels.length; i++) {
      var cur = comp_rels[i]
      if (!cur.glue_sources || !cur.glue_sources.length) {
        continue
      }
      all_glue_sources.push.apply(all_glue_sources, cur.glue_sources)
    }
    if (!all_glue_sources.length) {
      return emptyArray
    }

    return all_glue_sources.map(prepareGlueSourceRuntime)
  }
)

export default provideGlueRels
