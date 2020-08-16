
import getModels from './getModels'
import getValues from './getValues'

export default function(md, dep, data) {
  var models = getModels(md, dep, data)
  return models && getValues(models, dep)
}
