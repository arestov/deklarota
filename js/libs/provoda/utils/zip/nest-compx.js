define(function(require) {
'use strict'
var pvState = require('../state')


var getOneValue = function(dep, item) {
  if (!item) {
    return item;
  }

  if (dep.result_type != 'state') {
    return item
  }

  return pvState(item, dep.state.path)
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
    return list && mapList(dep, list).every(Boolean)
  },
  'some': function(list, dep) {
    return list && mapList(dep, list).some(Boolean)
  },
  'find': function(list, dep) {
    return list && mapList(dep, list).find(Boolean)
  },
  'filter': function(list, dep) {
    return list && mapList(dep, list).filter(Boolean)
  },
  'all': function(list, dep) {
    return list && mapList(dep, list)
  },
  'length': function(list) {
    return list && list.length
  },
  'notEmpty': function(list) {
    return Boolean(list && list.length)
  },

}

return zip_fns

})
