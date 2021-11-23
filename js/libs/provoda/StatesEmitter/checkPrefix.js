

import spv from '../../spv'
import hp from '../helpers'

const empty = function() {}

export default function checkPrefix(prefix, Declr, result_prop, fn) {
  const getUnprefixed = spv.getDeprefixFunc(prefix)
  const hasPrefixedProps = hp.getPropsPrefixChecker(getUnprefixed)
  const merge = mergePrefixed(prefix)

  const callback = fn || empty

  return function(self, props) {
    if (!hasPrefixedProps(props)) {
      return
    }

    const fresh = {}

    for (const prop_name in props) {
      const item_name = getUnprefixed(prop_name)
      if (!item_name) {continue}

      fresh[item_name] = props[prop_name]
        ? new Declr(item_name, props[prop_name])
        : null
    }

    self[result_prop] = merge(self, self[result_prop], fresh)
    callback(self, self[result_prop], props)
    return self[result_prop]
  }
}

function mergePrefixed(prefix) {
  const getUnprefixed = spv.getDeprefixFunc(prefix)
  return function(self, old, fresh) {
    const result = {}

    for (const prop_name in self) {
      const item_name = getUnprefixed(prop_name)
      if (!item_name) {continue}

      result[item_name] = fresh.hasOwnProperty(item_name)
        ? fresh[item_name]
        : old[item_name]
    }

    return result
  }
}
