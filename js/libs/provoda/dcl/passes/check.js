define(function(require) {
'use strict'

var spv = require('spv')
var cloneObj = spv.cloneObj
var Dcl = require('./dcl')
var rebuildHandleState = require('./handleState/rebuild')
var rebuildHandleNesting = require('./handleNesting/rebuild')
var rebuildHandleInit = require('./handleInit/rebuild')

return function checkPasses(self, props) {
  if (!props.hasOwnProperty('actions')) {
    return
  }

  var result = {}
  cloneObj(result, self._extendable_passes_index || {})

  for (var name in props['actions']) {
    if (!props['actions'].hasOwnProperty(name)) {
      continue;
    }
    result[name] = new Dcl(name, props['actions'][name])
  }

  rebuildHandleState(self, result)
  rebuildHandleNesting(self, result)
  rebuildHandleInit(self, result)

  self._extendable_passes_index = result
}

})
