
import test from 'ava'
import requirejs from 'requirejs'
import './require-config'
var parse = requirejs('./parse')

test('check parsing', function(t) {


  t.snapshot(parse('tracks/[:artist],[:track]'))
})
