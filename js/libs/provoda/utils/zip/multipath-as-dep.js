define(function(require) {
'use strict'
var isMeaningfulValue = require('../isMeaningfulValue')

var zip_fns = {
  'one': function(list) {
    return list && list[0]
  },
  'every': function(list) {
    return list && list.every(isMeaningfulValue)
  },
  'some': function(list) {
    return list && list.some(isMeaningfulValue)
  },
  'find': function(list) {
    return list && list.find(isMeaningfulValue)
  },
  'filter': function(list) {
    return list && list.filter(isMeaningfulValue)
  },
  'all': function(list) {
    return list
  }
}

return zip_fns
})
