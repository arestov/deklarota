import asString from '../utils/multiPath/asString'
import initInputAttrs from '../dcl/attrs/input/init'
import emptyArray from '../emptyArray'
import { defaultMetaAttrValues as defaultRelMetaAttrsValues } from './rel/definedMetaAttrs'

import { createFakeEtr, computeInitialAttrs, getComplexInitList } from '../updateProxy'

const fillExternalDeps = (self, first_changes_list) => {
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

  if (self.__attrs_uniq_external_deps) {
    var external_deps = self.__attrs_uniq_external_deps
    for (var i = 0; i < external_deps.length; i++) {
      var cur = external_deps[i]
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

export default function ensureInitialAttrs(self) {
  if (self.constructor.prototype.hasOwnProperty('_fake_etr')) {
    return
  }

  var first_changes_list = []

  for (var i = 0; i < self.__defined_attrs_bool.length; i++) {
    var cur = self.__defined_attrs_bool[i]
    if (cur.type != 'bool') {
      continue
    }
    first_changes_list.push(cur.name, false)
  }


  fillExternalDeps(self, first_changes_list)

  var default_attrs = initInputAttrs(self)
  for (var attr_name in default_attrs) {
    first_changes_list.push(attr_name, default_attrs[attr_name])
  }

  var fake = createFakeEtr(self, first_changes_list)

  computeInitialAttrs(fake.etr, fake.total_original_states, fake.total_ch, fake.states_changing_stack)

  var more_changes = getComplexInitList(fake.etr, fake.total_ch)
  if (more_changes && more_changes.length) {
    fake.states_changing_stack.push(more_changes)
    computeInitialAttrs(fake.etr, fake.total_original_states, fake.total_ch, fake.states_changing_stack)
  }


  self.constructor.prototype._fake_etr = fake
}
