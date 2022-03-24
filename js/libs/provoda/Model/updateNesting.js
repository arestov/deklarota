import hp from '../helpers'
import nestWIndex from '../nest-watch/index'
import isNestingChanged from '../utils/isNestingChanged'
import _passHandleNesting from '../dcl/passes/handleNesting/handle'
import validateRuntimeValue from '../dcl/nests/validateRuntimeValue'

import handleMentions from './mentions/handleRelChange'
import isGlueRel from './mentions/isGlueRel'
import triggerLightRelChange from '../dcl/glue_rels/light_rel_change/trigger'
import updateMetaAttrs from './rel/updateMetaAttrs'
import emptyArray from '../emptyArray'
import sameName from '../sameName'

const checkNesting = nestWIndex.checkNesting

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

  validateRuntimeValue(self, collection_name, input)

  if (!self.children_models) {
    self.children_models = {}
  }

  const old_value = self.children_models[collection_name]

  const array = Array.isArray(input) ? getUniqReadonly(input) : input

  if (!isNestingChanged(old_value, array)) {
    return self
  }

  self.children_models[collection_name] = array



  if (isGlueRel(self, collection_name)) {
    handleMentions(self, collection_name, old_value, array)
    triggerLightRelChange(self, collection_name, array)
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

  triggerLightRelChange(self, collection_name, array)

  checkNesting(self, collection_name, array, removed)
  // !?

  return self
}
