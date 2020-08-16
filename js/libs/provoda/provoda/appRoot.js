
var spv = require('spv')
var prepare = require('../structure/prepare')
var AppModel = require('./AppModel')

export default function(props, init) {
  if (typeof props == 'function') {
    if (init) {
      throw new Error('you cant pass init with Constr')
    }
    return prepare(props)
  }

  var all = {}
  if (init) {
    all.init = init
  }
  all.skip_code_path = true

  var App = spv.inh(AppModel, all, props)
  return prepare(App)

};
