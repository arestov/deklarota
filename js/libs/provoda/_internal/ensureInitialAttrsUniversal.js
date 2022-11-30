import { computeInitialAttrs, createFakeEtr, freezeFakeEtr, getComplexInitList } from '../updateProxy'
import initInputAttrs from '../dcl/attrs/input/init'

const ensureInitialAttrsUniversal = (fn) => (self) => {
  if (self.constructor.prototype.hasOwnProperty('_fake_etr')) {
    return
  }

  const first_changes_list = []


  fn(self, first_changes_list)

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

export default ensureInitialAttrsUniversal
