

import spv from 'spv'
import getSubpageItem from './getSubpageItem'

export default function addSubpage(self, name, cur) {
  if (self._sub_pages[name]) {
    throw new Error('already have ' + name)
  }
  var item = getSubpageItem(cur, 'sub-page-' + name, false, name, 'spad')
  self._sub_pages[name] = item

  if (!self.hasOwnProperty('_chi_sub_pages_side')) {
    self._chi_sub_pages_side = self._chi_sub_pages_side ? spv.cloneObj(self._chi_sub_pages_side) : {}
  }
  self._chi_sub_pages_side[item.key] = item.constr

  if (!self.hasOwnProperty('_build_cache_sub_pages_side')) {
    self._build_cache_sub_pages_side = self._build_cache_sub_pages_side ? spv.cloneObj(self._build_cache_sub_pages_side) : {}
  }
  self._build_cache_sub_pages_side[name] = item

}
