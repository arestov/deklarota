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

return {
  'all': arrayClone,
  'one': oneFromArray,
}

})
