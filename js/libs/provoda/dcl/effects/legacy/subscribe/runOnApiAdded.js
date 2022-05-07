

import makeBindChanges from './run/makeBindChanges'

export default function(self, prev_values, next_values) {
  if (prev_values == null && next_values == null) {
    return
  }

  makeBindChanges(self, prev_values, next_values)
}
