
var cloneObj = require('./cloneObj')

export default function(cb) {
  var result = {}
  var add = function(obj) {
    cloneObj(result, obj)
  }
  cb(add)
  return result
};
