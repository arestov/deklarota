define(function(require) {
'use strict';
var spv = require('spv');
var NestWatch = require('../nest-watch/NestWatch');
var getStateWriter = require('../nest-watch/getStateWriter');
var getParsedState = require('./getParsedState')
var toMultiPath = require('./NestingSourceDr/toMultiPath')
var parseMultiPath = require('./multiPath/parse')
var asString = require('./multiPath/asString')

var fromMultiPath = getParsedState.fromMultiPath

var getMultiPath = function(full_name) {
  if (full_name && full_name.charAt(0) == '<') {
    return parseMultiPath(full_name)
  }
}

var ensureResult = function(full_name) {
  var multi_path = getMultiPath(full_name)
  if (!multi_path) {
    return null
  }

  return fromMultiPath(multi_path, asString(multi_path))
}

var getEncodedState = spv.memorize(function getEncodedState(state_name) {


  var result1 = getParsedState(state_name)
  // if (result1) { // uncomment to help migrate
  //   var nice = fromLegacy(state_name)
  //   var best = asString(nice)
  //   console.warn('replace ' + state_name + ' by ' + best)
  // }

  var result = result1 || ensureResult(state_name)

  if (!result) {
    return null
  }

  if (result.rel_type !== 'nesting') {
    return result
  }

  var doubleHandler = getStateWriter(result.full_name, result.state_name, result.zip_name);
  var nwatch = new NestWatch(toMultiPath(result.nesting_source), result.state_name, {
    onchd_state: doubleHandler,
    onchd_count: doubleHandler,
  })

  var copy = spv.cloneObj({}, result);
  copy.nwatch = nwatch

  return copy
});

return getEncodedState
})
