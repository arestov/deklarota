import { replaceRefs } from './replaceRefs'
import { needsRefs } from './needsRefs'
import { isOk } from './isOk'

export const useRefIfNeeded = function(target, md, raw_value, mut_action_result) {
  if (isOk(raw_value)) {
    return raw_value
  }

  if (!needsRefs(raw_value)) {
    return raw_value
  }

  if (!target.options.can_use_refs) {
    throw new Error('to use `use_ref_id` declare `can_use_refs` as option')
  }

  return replaceRefs(md, raw_value, {}, mut_action_result)
}
