define(function(require) {
'use strict'
var getModels = require('./getModels')
var getValues = require('./getValues')

return function(md, dep, data) {
  var models = getModels(md, dep, data)
  return models && getValues(models, dep)
}
})
