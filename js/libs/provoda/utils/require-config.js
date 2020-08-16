import requirejs from 'requirejs'
import path from 'path'

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
