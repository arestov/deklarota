import isPublicRel from './isPublicRel'

const createMutableRelStore = (self) => {
  const mpx_children_models_to_mutate = {}
  for (const rel_name in self.children_models) {
    if (!self.children_models.hasOwnProperty(rel_name)) {
      continue
    }
    if (!isPublicRel(self, rel_name)) {
      continue
    }
    mpx_children_models_to_mutate[rel_name] = self.children_models[rel_name]
  }

  return mpx_children_models_to_mutate
}

export default createMutableRelStore
