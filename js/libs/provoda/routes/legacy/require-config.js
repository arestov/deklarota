var requirejs = require('requirejs');
var path = require('path')

requirejs.config({
  baseUrl: __dirname,
  map: {
		'*': {
			spv: path.join(process.cwd(), 'js/libs/spv.js'),
      pv: path.join(process.cwd(), 'js/libs/provoda/provoda'),
			__lib: path.join(process.cwd(), 'js/libs/provoda'),
		}
	},
})

module.exports = requirejs
