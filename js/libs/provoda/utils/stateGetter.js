
import spv from 'spv'
import isSpecialState from './isSpecialState'
var asNil = function(val) {
  if (val == null) {
    return
  }

  return val
}

var getTargetField = spv.getTargetField
var getFieldsTree = spv.getFieldsTree
var stateGetter = spv.memorize(function stateGetter(state_path) {
  if (isSpecialState(state_path)) {
    return function getSpecialState(states) {
      return asNil(states[state_path])
    }
  }
  var path = getFieldsTree(state_path)
  if (path.length != 1) {
    return function getTreeState(states) {
      // has asNil internally
      return getTargetField(states, path)
    }
  }

  var attr_name = path[0]
  return function getSimpleState(states) {
    return asNil(states[attr_name])
  }
})

export default stateGetter
