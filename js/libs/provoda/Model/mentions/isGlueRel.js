const isGlueRel = function(self, rel_key) {
  const skeleton = self.__global_skeleton

  return skeleton.glue_rels.has(rel_key)
}

export default isGlueRel
