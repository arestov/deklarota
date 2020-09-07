import prepareGlueSourceRuntime from './runtime/prepare'

const emptyArray = Object.freeze([])

const provideGlueRels = function(self) {
  if (!self.hasOwnProperty('_nest_by_type_listed')) {
    // nothing changed
    return
  }
  var comp_rels = self._nest_by_type_listed && self._nest_by_type_listed.comp
  if (!comp_rels || !comp_rels.length) {
    self.__rel_all_glue_sources = emptyArray
    return
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
    self.__rel_all_glue_sources = emptyArray
    return
  }

  self.__rel_all_glue_sources = all_glue_sources.map(prepareGlueSourceRuntime)
}

export default provideGlueRels
