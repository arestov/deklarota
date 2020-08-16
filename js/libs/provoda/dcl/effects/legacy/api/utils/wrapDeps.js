
var spv = require('spv')

export default function wrapDeps(deps) {
  if (typeof deps == 'string') {
    return [[deps]]
  }
  if (Array.isArray(deps) && typeof deps[0] == 'string') {
    return [deps, spv.hasEveryArgs]
  }

  return deps
};
