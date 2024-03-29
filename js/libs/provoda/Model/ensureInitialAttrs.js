import asString from '../utils/multiPath/asString'
import emptyArray from '../emptyArray'
import { defaultMetaAttrValues as defaultRelMetaAttrsValues } from './rel/definedMetaAttrs'
import ensureInitialAttrsUniversal from '../_internal/ensureInitialAttrsUniversal'
import { hasOwnProperty } from '../hasOwnProperty'

const fillExternalDeps = (self, first_changes_list) => {
  if (self._extendable_nest_index) {
    const rels = self._extendable_nest_index
    for (const rel_name in rels) {
      if (!rels.hasOwnProperty(rel_name)) {
        continue
      }
      const list = defaultRelMetaAttrsValues(rel_name)
      first_changes_list.push(...list)
    }
  }

  if (self.__attrs_uniq_external_deps) {
    const external_deps = self.__attrs_uniq_external_deps
    for (let i = 0; i < external_deps.length; i++) {
      const cur = external_deps[i]
      if (!cur.nesting || !cur.nesting.path) {
        continue
      }
      if (cur.zip_name && cur.zip_name != 'all') {
        continue
      }

      first_changes_list.push(asString(cur), emptyArray)
    }
  }
}


const ensureInitialAttrs = ensureInitialAttrsUniversal((self, first_changes_list) => {
  for (let i = 0; i < self.__defined_attrs_bool.length; i++) {
    const cur = self.__defined_attrs_bool[i]
    if (cur.type != 'bool') {
      continue
    }

    if (hasOwnProperty(self.compx_check, cur.name)) {
      continue
    }

    first_changes_list.push(cur.name, false)
  }

  fillExternalDeps(self, first_changes_list)
})

export default ensureInitialAttrs
