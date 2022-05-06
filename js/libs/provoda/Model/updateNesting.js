import hp from '../helpers'
import isNestingChanged from '../utils/isNestingChanged'
import _passHandleNesting from '../dcl/passes/handleNesting/handle'
import validateRuntimeValue from '../dcl/nests/validateRuntimeValue'

import handleMentions from './mentions/handleRelChange'
import isGlueRel from './mentions/isGlueRel'
import updateMetaAttrs from './rel/updateMetaAttrs'
import emptyArray from '../emptyArray'
import sameName from '../sameName'
import checkUniqOnListUpdate from '../dcl/nests/uniq/checkOnListUpdate'


function getUniqReadonly(input) {
  // yes, make Object.freeze for input array!
  Object.freeze(input)

  if (!input.length) {
    return emptyArray
  }

  // share same memory object of array when possible
  const uniq = new Set(input)
  if (input.length == uniq.size) {
    return input
  }

  return Object.freeze(Array.from(uniq))
}

export default function updateNesting(self, collection_name_raw, input) {
  const collection_name = sameName(collection_name_raw)

  if (self._currentMotivator() == null) {
    throw new Error('wrap updateRel call in `.input()`')
  }

  if (Array.isArray(input)) {
    for (let mm = 0; mm < input.length; mm++) {
      const cur = input[mm]
      if (cur == null) {
        throw new Error('rel list should not have holes')
      }
    }
  }

  validateRuntimeValue(self, collection_name, input)

  if (!self.children_models) {
    self.children_models = {}
  }

  const old_value = self.children_models[collection_name]

  const array = Array.isArray(input) ? getUniqReadonly(input) : input

  if (!isNestingChanged(old_value, array)) {
    return self
  }

  checkUniqOnListUpdate(self, collection_name, array)

  self.children_models[collection_name] = array



  if (isGlueRel(self, collection_name)) {
    handleMentions(self, collection_name, old_value, array)
    return
  }

  if (old_value && array) {
    const arr1 = Array.isArray(old_value)
    const arr2 = Array.isArray(array)
    if (arr1 != arr2) {
      throw new Error('nest type must be stable')
    }
  }


  updateMetaAttrs(self, collection_name, array)

  const removed = hp.getRemovedNestingItems(array, old_value)

  _passHandleNesting(self, collection_name, old_value, array)

  handleMentions(self, collection_name, old_value, array)

  // !?

  self.sendCollectionChange(collection_name, array, old_value, removed)

  return self
}
