define(function (require) {
'use strict';
var spv = require('spv');
var spvSet = spv.set
var hp = require('../helpers');
var StatesLabour = require('../StatesLabour');
var updateProxy = require('../updateProxy');
var nestWIndex = require('../nest-watch/index');
var checkNesting = nestWIndex.checkNesting;
var isNestingChanged = require('../utils/isNestingChanged')
var pvUpdate = updateProxy.update;
var cloneObj = spv.cloneObj;
var _passHandleNesting = require('../dcl/passes/handleNesting/handle')

var hasDot = spv.memorize(function(nesting_name) {
  return nesting_name.indexOf('.') != -1;
});

function getUniqCopy(input) {
  var tempSet = spvSet.create()
  for (var i = 0; i < input.length; i++) {
    var cur = input[i]
    if (!cur) {
      continue;
    }
    spvSet.add(tempSet, cur._provoda_id, cur)
  }

  return tempSet.list
}

return function updateNesting(self, collection_name, input, opts, spec_data) {
  if (hasDot(collection_name)){
    throw new Error('remove "." (dot) from name');
  }

  if (!self.children_models) {
    self.children_models = {};
  }

  var old_value = self.children_models[collection_name];

  var array = Array.isArray(input) ? getUniqCopy(input) : input

  if (!isNestingChanged(old_value, array)) {
    return self
  }

  var zdsv = self.zdsv;
  if (zdsv) {
    zdsv.abortFlowSteps('collch', collection_name);
  }


  self.children_models[collection_name] = array;

  if (old_value && array) {
    var arr1 = Array.isArray(old_value);
    var arr2 = Array.isArray(array);
    if (arr1 != arr2) {
      throw new Error('nest type must be stable');
    }
  }

  var removed = hp.getRemovedNestingItems(array, old_value);
  checkNesting(self, collection_name, array, removed);
  // !?


  if (!opts || !opts.skip_report){
    self.sendCollectionChange(collection_name, array, old_value, removed);
  }

  _passHandleNesting(self, collection_name, old_value, array)

  var count = Array.isArray(array)
    ? array.length
    : (array ? 1 : 0);

  var name_for_length_legacy = collection_name + '$length'
  var name_for_length_modern = '$meta$nests$' + collection_name + '$length'

  var name_for_exists_legacy = collection_name + '$exists'
  var name_for_exists_modern = '$meta$nests$' + collection_name + '$exists'

  self._attrs_collector.defineAttr(name_for_length_legacy, 'int')
  self._attrs_collector.defineAttr(name_for_length_modern, 'int')
  self._attrs_collector.defineAttr(name_for_exists_legacy, 'bool')
  self._attrs_collector.defineAttr(name_for_exists_modern, 'bool')

  pvUpdate(self, name_for_length_legacy, count);
  pvUpdate(self, name_for_length_modern, count);
  pvUpdate(self, name_for_exists_legacy, Boolean(count));
  pvUpdate(self, name_for_exists_modern, Boolean(count));

  return self;
}
});
