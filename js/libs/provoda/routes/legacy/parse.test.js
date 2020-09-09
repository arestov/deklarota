import test from 'ava'

import parse from './parse'

test('check parsing', function(t) {
  t.snapshot(parse('tracks/[:artist],[:track]'))
})
