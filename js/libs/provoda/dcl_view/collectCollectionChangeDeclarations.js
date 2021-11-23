
import spv from '../../spv'
import getPropsPrefixChecker from '../utils/getPropsPrefixChecker'
const getUnprefixed = spv.getDeprefixFunc('collch-')
const hasPrefixedProps = getPropsPrefixChecker(getUnprefixed)

const solvingOf = function(declr) {
  const by_model_name = declr.by_model_name
  const space = declr.space != 'main' && declr.space
  const is_wrapper_parent = declr.is_wrapper_parent
  const needs_expand_state = declr.needs_expand_state
  if (by_model_name || space || is_wrapper_parent || needs_expand_state) {
    return {
      by_model_name: by_model_name,
      space: space,
      is_wrapper_parent: is_wrapper_parent,
      needs_expand_state: needs_expand_state
    }
  }
}
const parseCollectionChangeDeclaration = function(collch) {
  if (typeof collch == 'string') {
    collch = {
      place: collch
    }
  }
  let expand_state = collch.needs_expand_state
  if (expand_state && typeof expand_state != 'string') {
    expand_state = 'can_expand'
  }

  const is_wrapper_parent = collch.is_wrapper_parent && collch.is_wrapper_parent.match(/^\^+/gi)

  const declr = {
    place: collch.place,
    by_model_name: collch.by_model_name,
    space: collch.space || 'main',
    strict: collch.strict,
    is_wrapper_parent: is_wrapper_parent && is_wrapper_parent[0].length,
    opts: collch.opts,
    needs_expand_state: expand_state || null,
    not_request: collch.not_request,
    limit: collch.limit,
    solving: null
  }
  const solving = solvingOf(declr)
  if (solving) {
    declr.solving = solving
  }
  return declr
}

export default function(self, props) {
  const need_recalc = hasPrefixedProps(props)


  if (!need_recalc) {
    return
  }
  let prop

  self.dclrs_fpckgs = {}

  for (prop in self) {
    if (getUnprefixed(prop)) {
      const collch = self[ prop ]
      if (!collch) {
        continue
      }
      const nesting_name = getUnprefixed(prop)
      if (typeof collch == 'function') {
        self.dclrs_fpckgs[ nesting_name ] = collch
      } else {
        if (Array.isArray(collch)) {
          throw new Error('do not support arrays anymore')
        }
        self.dclrs_fpckgs[ nesting_name ] = parseCollectionChangeDeclaration(collch)
      }

    }
  }
  return true
}
