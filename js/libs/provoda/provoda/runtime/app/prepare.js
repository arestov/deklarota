define(function(require) {
'use strict'

var AppRuntime = require('./AppRuntime')

return function(runOptions) {
  var _highway = new AppRuntime(runOptions)
  return _highway
}
})
