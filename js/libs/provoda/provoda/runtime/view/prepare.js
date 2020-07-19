define(function(require) {
'use strict'

var ViewRuntime = require('./ViewRuntime')

return function(runOptions) {
  var _highway = new ViewRuntime(runOptions)
  return _highway
}
})
