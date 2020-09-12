import initInputAttrs from '../dcl/attrs/input/init'
import { defaultMetaAttrValues as defaultRelMetaAttrsValues } from './rel/definedMetaAttrs'

import { createFakeEtr, computeInitialAttrs, getComplexInitList } from '../updateProxy'

export default function ensureInitialAttrs(self) {
  if (self._fake_etr != null) {
    return
  }

  var first_changes_list = getComplexInitList(self) || []

  for (var i = 0; i < self.__defined_attrs_bool.length; i++) {
    var cur = self.__defined_attrs_bool[i]
    if (cur.type != 'bool') {
      continue
    }
    first_changes_list.push(cur.name, false)
  }

  if (self._extendable_nest_index) {
    var rels = self._extendable_nest_index
    for (var rel_name in rels) {
      if (!rels.hasOwnProperty(rel_name)) {
        continue
      }
      var list = defaultRelMetaAttrsValues(rel_name)
      first_changes_list.push(...list)
    }
  }



  var default_attrs = initInputAttrs(self)
  for (var attr_name in default_attrs) {
    first_changes_list.push(attr_name, default_attrs[attr_name])
  }

  var fake = createFakeEtr(self, first_changes_list)

  computeInitialAttrs(fake.etr, fake.total_original_states, fake.total_ch, fake.states_changing_stack)
  self.constructor.prototype._fake_etr = fake
}
