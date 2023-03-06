import _getInterface from '../../../../_internal/interfaces/_getInterface'

export function isEffectApiReady(self, effect) {
  for (let cc = 0; cc < effect.apis.length; cc++) {
    const api = effect.apis[cc]

    if (!_getInterface(self, api)) {
      return false
    }
  }

  return true
}


export function isEffectConditionReady(self, effect) {
  if (!effect.deps) {
    return true
  }

  return self.getAttr(effect.deps_name)
}

export function apiAndConditionsReady(self, effect) {
  return Boolean(isEffectConditionReady(self, effect) && isEffectApiReady(self, effect))
}
