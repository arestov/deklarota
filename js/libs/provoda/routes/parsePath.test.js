
var test = require('ava')
var requirejs = require('requirejs');
var path = require('path')
requirejs.config({
  baseUrl: __dirname,
  map: {
		'*': {
			spv: path.join(process.cwd(), 'js/libs/spv.js'),
		}
	},
})
var parse = requirejs('./parsePath')

test('check parsing', function(t) {
  'use strict'

  t.snapshot(parse('tracks/[:artist],[:track]'));
})
