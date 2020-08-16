
var test = require('ava')
var requirejs = require('requirejs')
require('./require-config')
var parse = requirejs('./parse')

test('check parsing', function(t) {


  t.snapshot(parse('tracks/[:artist],[:track]'))
})
