
import spv from '../../spv'
import hp from '../helpers'
import nestWIndex from '../nest-watch/index'
import isNestingChanged from '../utils/isNestingChanged'
import _updateAttr from '../_internal/_updateAttr'
import _passHandleNesting from '../dcl/passes/handleNesting/handle'
import handleMentions from './mentions/handleRelChange'
var checkNesting = nestWIndex.checkNesting

var hasDot = spv.memorize(function(nesting_name) {
  return nesting_name.indexOf('.') != -1
})

function getUniqCopy(input) {
  return Array.from(new Set(input))
}

export default function updateNesting(self, collection_name, input, opts) {

  if (self._currentMotivator() == null) {
    throw new Error('wrap updateRel call in `.input()`')
  }

  if (hasDot(collection_name)) {
    throw new Error('remove "." (dot) from name')
  }

  if (!self.children_models) {
    self.children_models = {}
  }

  var old_value = self.children_models[collection_name]

  var array = Array.isArray(input) ? getUniqCopy(input) : input

  if (!isNestingChanged(old_value, array)) {
    return self
  }

  self.children_models[collection_name] = array

  if (old_value && array) {
    var arr1 = Array.isArray(old_value)
    var arr2 = Array.isArray(array)
    if (arr1 != arr2) {
      throw new Error('nest type must be stable')
    }
  }



  var count = Array.isArray(array)
    ? array.length
    : (array ? 1 : 0)

  var name_for_length_legacy = collection_name + '$length'
  var name_for_length_modern = '$meta$nests$' + collection_name + '$length'

  var name_for_exists_legacy = collection_name + '$exists'
  var name_for_exists_modern = '$meta$nests$' + collection_name + '$exists'

  self._attrs_collector.defineAttr(name_for_length_legacy, 'int')
  self._attrs_collector.defineAttr(name_for_length_modern, 'int')
  self._attrs_collector.defineAttr(name_for_exists_legacy, 'bool')
  self._attrs_collector.defineAttr(name_for_exists_modern, 'bool')

  _updateAttr(self, name_for_length_legacy, count)
  _updateAttr(self, name_for_length_modern, count)
  _updateAttr(self, name_for_exists_legacy, Boolean(count))
  _updateAttr(self, name_for_exists_modern, Boolean(count))


  var removed = hp.getRemovedNestingItems(array, old_value)

  _passHandleNesting(self, collection_name, old_value, array)

  handleMentions(self, collection_name, old_value, array)

  checkNesting(self, collection_name, array, removed)
  // !?

  if (opts == null || !opts.skip_report) {
    self.sendCollectionChange(collection_name, array, old_value, removed)
  }


  return self
}
