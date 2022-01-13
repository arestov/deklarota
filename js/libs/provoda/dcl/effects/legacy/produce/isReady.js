
export function isEffectApiReady(self, effect) {
  for (let cc = 0; cc < effect.apis.length; cc++) {
    const api = effect.apis[cc]

    if (!self._interfaces_used[api]) {
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
