
import replaceModelInState from './replaceModelInState'

const assignPublicAttrs = function(cur_md, target) {
  const result = target
  const public_attrs = cur_md.__getPublicAttrs()
  for (let i = 0; i < public_attrs.length; i++) {
    const state_name = public_attrs[i]
    const state = cur_md.states[state_name]
    result[state_name] = replaceModelInState(state)
  }

  return result
}

const ensurePublicAttrs = function(cur_md) {
  const result = assignPublicAttrs(cur_md, {})
  return result
}

ensurePublicAttrs.assignPublicAttrs = assignPublicAttrs

export default ensurePublicAttrs
