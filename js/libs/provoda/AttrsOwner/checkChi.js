

import spv from '../../spv'
import hp from '../helpers'
import structureChild from '../structure/child'

const getUnprefixed = spv.getDeprefixFunc('chi-')
const hasPrefixedProps = hp.getPropsPrefixChecker(getUnprefixed)

const cloneObj = spv.cloneObj

export const checkChiProps = (self, props) => {
  if (!hasPrefixedProps(props)) {
    return
  }

  const build_index = self._build_cache_chi
  self._build_cache_chi = build_index ? cloneObj(build_index) : {}

  for (const prop_name in props) {
    const chi_name = getUnprefixed(prop_name)
    if (!chi_name) {continue}

    self._build_cache_chi[chi_name] = props[prop_name]
  }
}

export default function checkChildrenConstuctors(self) {


  if (!self.hasOwnProperty('_build_cache_chi')) {return}

  self._chi = {}

  for (const chi_name in self._build_cache_chi) {
    self._chi['chi-' + chi_name] = structureChild(chi_name, self._build_cache_chi[chi_name], ['custom-chi'])
  }
}
