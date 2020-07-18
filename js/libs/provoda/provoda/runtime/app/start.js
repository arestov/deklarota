define(function(require) {
'use strict'

var AppRuntime = require('./AppRuntime')

return function(appOptions, runOptions) {
  var _highway = new AppRuntime(runOptions)
  return _highway.start(appOptions)
}
})
