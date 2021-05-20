import hp from '../helpers'
import nestWIndex from '../nest-watch/index'
import isNestingChanged from '../utils/isNestingChanged'
import _passHandleNesting from '../dcl/passes/handleNesting/handle'
import handleMentions from './mentions/handleRelChange'
import triggerLightRelChange from '../dcl/glue_rels/light_rel_change/trigger'
import updateMetaAttrs from './rel/updateMetaAttrs'
import emptyArray from '../emptyArray'
import sameName from '../sameName'

var checkNesting = nestWIndex.checkNesting

function getUniqCopy(input) {
  if (!input.length) {
    return emptyArray
  }
  var result = Array.from(new Set(input))
  return result.length ? result : emptyArray
}

const isGlueRel = function(self, rel_key) {
  var skeleton = self.__global_skeleton

  return skeleton.glue_rels.has(rel_key)
}

export default function updateNesting(self, collection_name_raw, input, opts) {
  const collection_name = sameName(collection_name_raw)

  if (self._currentMotivator() == null) {
    throw new Error('wrap updateRel call in `.input()`')
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



  if (isGlueRel(self, collection_name)) {
    handleMentions(self, collection_name, old_value, array)
    triggerLightRelChange(self, collection_name, array)
    return
  }

  if (old_value && array) {
    var arr1 = Array.isArray(old_value)
    var arr2 = Array.isArray(array)
    if (arr1 != arr2) {
      throw new Error('nest type must be stable')
    }
  }


  updateMetaAttrs(self, collection_name, array)

  var removed = hp.getRemovedNestingItems(array, old_value)

  _passHandleNesting(self, collection_name, old_value, array)

  handleMentions(self, collection_name, old_value, array)

  triggerLightRelChange(self, collection_name, array)

  checkNesting(self, collection_name, array, removed)
  // !?

  if (opts == null || !opts.skip_report) {
    self.sendCollectionChange(collection_name, array, old_value, removed)
  }


  return self
}
