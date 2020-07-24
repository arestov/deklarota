define(function(require) {
'use strict'
var spv = require('spv')
var pvState = require('../state');

var stateOf = spv.memorize(function(state_name) {
  return function(md) {
    return pvState(md, state_name);
  };
});

var stateG = function(callback) {
  return function(state_name) {
    return callback(stateOf(state_name));
  };
};

var toZipFunc = function(toValue) {
  return spv.memorize(stateG(toValue));
};

var map = toZipFunc(function(state) {
  return function(array) {
    return array && array.map(state);
  };
});


var some = toZipFunc(function(state) {
  return function(array) {
    return array.some(state);
  };
});

var every = toZipFunc(function(state) {
  return function(array) {
    return array.every(state);
  };
});

var find = toZipFunc(function(state) {
  return function(array) {
    var item = array.find(state)
    return item && state(item);
  };
});

var filter = toZipFunc(function(state) {
  return function(array) {
    var list = array.filter(state)
    return list && list.map(state);
  };
});

var one = toZipFunc(function(state) {
  return function(array) {
    return array[0] && state(array[0]);
  };
});

return {
  'all': function(state_name) {
    return map(state_name)
  },
  'one': function(state_name) {
    return one(state_name);
  },
  'some': function(state_name) {
    return some(state_name);
  },
  'every': function(state_name) {
    return every(state_name)
  },
  'find': function(state_name) {
    return find(state_name)
  },
  'filter': function(state_name) {
    return filter(state_name)
  },
}

})
