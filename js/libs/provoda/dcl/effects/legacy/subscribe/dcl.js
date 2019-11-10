define(function(require) {
'use strict'
var spv = require('spv')

return function StateBindDeclr(key, data) {
  this.key = key
  this.apis = null;
  this.fn = null;

  this.state_name = key;

  if (Array.isArray(data)) {
    // legacy ?
    this.apis = spv.toRealArray(data[0]);
    this.fn = data[1];
    return
  }

  this.apis = spv.toRealArray(data.api);
  this.fn = data.fn;
};
})
