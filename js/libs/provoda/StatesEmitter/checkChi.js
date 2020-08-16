

import spv from '../../spv'
import hp from '../helpers'
import structureChild from '../structure/child'

var getUnprefixed = spv.getDeprefixFunc('chi-')
var hasPrefixedProps = hp.getPropsPrefixChecker(getUnprefixed)

var cloneObj = spv.cloneObj

export default function checkChildrenConstuctors(self, props) {
  if (!hasPrefixedProps(props)) {
    return
  }

  var build_index = self._build_cache_chi
  self._build_cache_chi = build_index ? cloneObj(build_index) : {}

  for (var prop_name in props) {
    var chi_name = getUnprefixed(prop_name)
    if (!chi_name) {continue}

    self._build_cache_chi[chi_name] = structureChild(prop_name, props[prop_name], ['custom-chi'])
  }

  self._chi = {}

  for (var chi_name in self._build_cache_chi) {
    self._chi['chi-' + chi_name] = self._build_cache_chi[chi_name]
  }
}
