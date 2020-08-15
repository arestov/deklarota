define(function(require) {
'use strict'
var cloneObj = require('./cloneObj')
return function(cb) {
  var result = {};
  var add = function(obj) {
    cloneObj(result, obj);
  };
  cb(add);
  return result;
};

})
