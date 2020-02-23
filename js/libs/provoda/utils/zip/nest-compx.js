define(function(require) {
'use strict'
var pvState = require('../state')
var isMeaningfulValue = require('../isMeaningfulValue')


var getOneValue = function(dep, item) {
  if (!item) {
    return item;
  }

  if (dep.result_type != 'state') {
    return item
  }

  return pvState(item, dep.state.base)
}

var mapList = function(dep, list) {
  var result = new Array(list.length)
  for (var i = 0; i < list.length; i++) {
    result[i] = getOneValue(dep, list[i])
  }
  return result
}

var zip_fns = {
  'one': function(list, dep) {
    return list && getOneValue(dep, list[0])
  },
  'every': function(list, dep) {
    return list && mapList(dep, list).every(isMeaningfulValue)
  },
  'some': function(list, dep) {
    return list && mapList(dep, list).some(isMeaningfulValue)
  },
  'find': function(list, dep) {
    return list && mapList(dep, list).find(isMeaningfulValue)
  },
  'all': function(list, dep) {
    return list && mapList(dep, list)
  }
}

return zip_fns

})
