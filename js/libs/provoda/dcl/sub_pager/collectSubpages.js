

import spv from '../../../spv'
import hp from '../../helpers'
import getSubpageItem from './getSubpageItem'

const getUnprefixed = spv.getDeprefixFunc('sub_page-')
const hasPrefixedProps = hp.getPropsPrefixChecker(getUnprefixed)


const buildMany = function(self) {
  self._build_cache_subpage_many = {}
  for (const prop_name in self.sub_page) {
    self._build_cache_subpage_many[prop_name] = getSubpageItem(self.sub_page[prop_name], 'sub-page-' + prop_name, false, prop_name, 'sp')
  }
}

export const depricateOldSubpages = (props) => {
  const changed_singled = hasPrefixedProps(props)
  if (changed_singled) {
    throw new Error('use sub_page: {}, sub_page-*')
  }
}

export default function collectSubpages(self) {
  const changed_pack = self.hasOwnProperty('sub_page')
  if (!changed_pack) {
    return
  }

  if (changed_pack) {
    buildMany(self)
  }

  const check = {}

  for (const key_many in self._build_cache_subpage_many) {
    if (check[key_many]) {
      continue
    }
    check[key_many] = self._build_cache_subpage_many[key_many]
  }

  self._chi_sub_pages = {}

  for (const page_name in check) {
    const cur = check[page_name]
    self._chi_sub_pages[cur.key] = cur.constr
  }

  if (self._build_cache_sub_pages_side) {
    for (const side_name in self._build_cache_sub_pages_side) {
      check[side_name] = self._build_cache_sub_pages_side[side_name]
    }
  }

  self._sub_pages = check


}
