define(function(require) {
'use strict'
var spv = require('spv')
var startsWith = spv.startsWith

return function getNetApiByDeclr(send_declr, sputnik, app) {
  var api_name = send_declr.api_name;
  if (typeof api_name == 'function') {
    return api_name.call(sputnik);
  }

  if (typeof api_name !== 'string') {
    return;
  }

  if (startsWith(api_name, '#')) {
    return (app || sputnik.app)._interfaces_using.used[api_name.replace('#', '')];
  }

  return sputnik._interfaces_using.used[api_name];
}
})
