define(function(require) {
'use strict'

var spv = require('spv')
var attr_zip_fns = require('../utils/zip/nest-watch-attr')
var rel_zip_fns = require('../utils/zip/nest-watch-rel')
var _updateAttr = require('_updateAttr')
var standart = require('./standartNWH')





var getZipFunc = spv.memorize(function(state_name, zip_name_raw) {
  var zip_name = zip_name_raw || 'all'
  if (!state_name) {
    var zip_fn = rel_zip_fns[zip_name]
    if (!zip_fn) {
      throw new Error('unknow zip func ' + zip_name)
    }
    return zip_fn
  }

  var createZipFn = attr_zip_fns[zip_name]
  if (!createZipFn) {
    throw new Error('unknow zip func ' + zip_name)
  }

  return createZipFn(state_name)
}, function(state_name, zip_name) {
  return (state_name || "") + '-' + (zip_name || "")
})

function hdkey(full_name, state_name, zip_func) {
  return (full_name || '') + '-' + (state_name || '') + '-' + (zip_func || '')
}

var createWriter = function(write) {
  return spv.memorize(function(full_name, state_name, zip_name) {
    var zip_func = getZipFunc(state_name, zip_name)
    return standart(function stateHandler(md, items) {
      write(md, full_name, items && zip_func(items))
    })
  }, hdkey)
}

var getStateWriter = createWriter(_updateAttr)

getStateWriter.createWriter = createWriter

return getStateWriter
})
