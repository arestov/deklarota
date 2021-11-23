
import getModels from '../../../utils/multiPath/getModels'


const getModelsFromBase = function(base, target, passed_data) {
  const multi_path = target.target_path
  return getModels(base, multi_path, passed_data, Boolean(target.options && target.options.action))
}

const getModelsFromManyBases = function(bases, target, passed_data) {
  if (!Array.isArray(bases)) {
    return getModelsFromBase(bases, target, passed_data)
  }

  const result = []
  for (let i = 0; i < bases.length; i++) {
    const mds = getModelsFromBase(bases[i], target, passed_data)
    if (Array.isArray(mds)) {
      Array.prototype.push.apply(result, mds)
    } else {
      result.push(mds)
    }
    if (!mds) {
      throw new Error('not expected to null model')
    }
  }
  return result
}

const getTargetModels = function(md, target, passed_data) {
  switch (target.options && target.options.base) {
    case 'arg_nesting_next': {
      return getModelsFromManyBases(passed_data.next_value, target, passed_data)
    }
    case 'arg_nesting_prev': {
      return getModelsFromManyBases(passed_data.prev_value, target, passed_data)
    }
  }

  return getModelsFromBase(md, target, passed_data)
}
export default getTargetModels
