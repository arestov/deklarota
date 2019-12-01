define(function(require) {
'use strict';
var getModels = require('../../../utils/multiPath/getModels')


var getModelsFromBase = function(base, target, passed_data) {
  var multi_path = target.target_path
  return getModels(base, multi_path, passed_data);
}

var getModelsFromManyBases = function(bases, target, passed_data) {
  if (!Array.isArray(bases)) {
    return getModelsFromBase(bases, target, passed_data)
  }

  var result = []
  for (var i = 0; i < bases.length; i++) {
    var mds = getModelsFromBase(bases[i], target, passed_data)
    if (Array.isArray(mds)) {
      Array.prototype.push.apply(result, mds);
    } else {
      result.push(mds)
    }
    if (!mds) {
      throw new Error('not expected to null model')
    }
  }
  return result;
}

var getTargetModels = function(md, target, passed_data) {
  switch (target.options && target.options.base) {
    case "arg_nesting_next": {
      return getModelsFromManyBases(passed_data.next_value, target, passed_data)
    }
    case "arg_nesting_prev": {
      return getModelsFromManyBases(passed_data.prev_value, target, passed_data)
    }
  }

  return getModelsFromBase(md, target, passed_data);
}
return getTargetModels

})
