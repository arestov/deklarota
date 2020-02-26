define(function() {
'use strict'

var zip_fns = {
  'one': function(list) {
    return list && list[0]
  },
  'every': function(list) {
    return list && list.every(Boolean)
  },
  'some': function(list) {
    return list && list.some(Boolean)
  },
  'find': function(list) {
    return list && list.find(Boolean)
  },
  'filter': function(list) {
    return list && list.filter(Boolean)
  },
  'all': function(list) {
    return list
  }
}

return zip_fns
})
