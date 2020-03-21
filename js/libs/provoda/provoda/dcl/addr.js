define(function() {
'use strict'

// var order = ['zip', 'attr', 'rel', 'route', 'anc'];

return function(params) {
  // ({zip: 'all', attr: 'name', rel: '', route: '', anc: ''})

  var zip_part = params.zip ? ('@' + params.zip + ':') : ''

  var attr = params.attr ? (zip_part + params.attr) : ''
  var relZip = !attr ? zip_part : ''
  var rel = params.rel ? (relZip + params.rel) : ''

  if (!rel && !attr && zip_part) {
    throw new Error('zip not needed')
  }

  return '< ' + [attr, rel, params.route || '', params.anc || ''].join(' < ')

}
})
