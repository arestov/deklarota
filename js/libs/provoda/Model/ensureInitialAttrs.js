import asString from '../utils/multiPath/asString'
import initInputAttrs from '../dcl/attrs/input/init'
import emptyArray from '../emptyArray'
import { defaultMetaAttrValues as defaultRelMetaAttrsValues } from './rel/definedMetaAttrs'

import { createFakeEtr, computeInitialAttrs, getComplexInitList, freezeFakeEtr } from '../updateProxy'
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

export default function ensureInitialAttrs(self) {
  if (self.constructor.prototype.hasOwnProperty('_fake_etr')) {
    return
  }

  const first_changes_list = []

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

  const default_attrs = initInputAttrs(self)
  for (const attr_name in default_attrs) {
    first_changes_list.push(attr_name, default_attrs[attr_name])
  }

  const fake = createFakeEtr(self, first_changes_list)

  computeInitialAttrs(fake.etr, fake.total_original_states, fake.total_ch, fake.states_changing_stack)

  const more_changes = getComplexInitList(fake.etr, fake.total_ch)
  if (more_changes && more_changes.length) {
    fake.states_changing_stack.push(more_changes)
    computeInitialAttrs(fake.etr, fake.total_original_states, fake.total_ch, fake.states_changing_stack)
  }


  freezeFakeEtr(fake)

  /*
    let's save only parts of etr.
    the rest should be removed by GC
  */
  self.constructor.prototype._fake_etr = Object.freeze({
    original_values: fake.etr.original_values,
    total_ch: fake.total_ch,
  })
}
