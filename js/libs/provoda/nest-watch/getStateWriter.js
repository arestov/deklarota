define(function (require) {
'use strict';

var spv = require('spv');
var zip_fns = require('../utils/zip/nest-watch')
var updateProxy = require('../updateProxy');
var pvUpdate = updateProxy.update;
var standart = require('./standartNWH');



var arrayClone = function(array) {
  if (Array.isArray(array)) {
    return array.slice(0);
  } else {
    return array;
  }
};


var getZipFunc = spv.memorize(function(state_name, zip_name) {
  if (!state_name) {
    return arrayClone;
  }

  var createZipFn = zip_fns[zip_name || 'all']
  if (!createZipFn) {
    throw new Error('unknow zip func ' + zip_name);
  }

  return createZipFn(state_name)
}, function(state_name, zip_name) {
  return (state_name || "") + '-' + (zip_name || "");
});

function hdkey(full_name, state_name, zip_func) {
  return (full_name || '') + '-' + (state_name || '') + '-' + (zip_func || '');
}

var createWriter = function(write) {
  return spv.memorize(function(full_name, state_name, zip_name) {
    var zip_func = getZipFunc(state_name, zip_name);
    return standart(function stateHandler(md, items) {
      write(md, full_name, items && zip_func(items));
    });
  }, hdkey);
}

var getStateWriter = createWriter(pvUpdate);

getStateWriter.createWriter = createWriter;

return getStateWriter;
});
