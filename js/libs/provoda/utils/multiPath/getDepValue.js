
var getModels = require('./getModels')
var getValues = require('./getValues')

export default function(md, dep, data) {
  var models = getModels(md, dep, data)
  return models && getValues(models, dep)
};
