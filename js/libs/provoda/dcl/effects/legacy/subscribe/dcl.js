define(function(require) {
'use strict'
var spv = require('spv')

var warnStateUsing = function() {
  if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
    return
  }

  console.warn('please use pass_name, not state_name')
}

var count = 0;

return function StateBindDeclr(key, data) {
  this.id = ++count
  this.key = key
  this.apis = null;
  this.fn = null;

  this.state_name = null;
  this.pass_name = null

  if (!data.state_name && !data.pass_name) {
    this.pass_name = key
  } else if (data.pass_name) {
    this.pass_name = data.pass_name
  } if (data.state_name) {
    warnStateUsing()
    this.state_name = data.state_name
  }

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
