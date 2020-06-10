define(function() {
'use strict'

var arrayClone = function(array) {
  if (Array.isArray(array)) {
    return array.slice(0);
  } else {
    return array;
  }
};

var oneFromArray = function (array) {
  if (Array.isArray(array)) {
    return array[0]
  }
  return array
}

var getLength = function(array) {
  if (Array.isArray(array)) {
    return array.length
  }

  return array ? 1 : 0
}

var notEmpty = function(array) {
  return Boolean(getLength(array))
}

return {
  'all': arrayClone,
  'one': oneFromArray,
  'length': getLength,
  'notEmpty': notEmpty,
}

})
