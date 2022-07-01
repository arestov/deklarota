
import getModels from './getModels'
import getValues from './getValues'

export default function(md, dep, data, autocreate_routed_deps) {
  const models = getModels(md, dep, data, null, autocreate_routed_deps)
  return models && getValues(models, dep)
}
