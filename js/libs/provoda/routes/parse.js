define(function(require) {
'use strict'
// var spv = require('spv')

var string_state_regexp = /((.*?)(\[\:(.+?)\]))|(.+)/g
// 0:                     1:((2:)(3:(4:)))|(:5)
var PREFIX = 2
var STATE_SOURCE = 3
var STATE = 4
var ALTERNATIVE = 5

// Add optional params - 'tracks/[:artist:next_value],([:track])'

var stateItem = function(text) {
  var parts = text.split(':')
  var dest = parts[0]
  var source = parts[1] || dest
  return [dest, source]
}

var reRegExpChar = /[\\^$.*+?()[\]{}|]/g
var reHasRegExpChar = RegExp(reRegExpChar.source)


var escapeRegExp = function(string) {
  return (string && reHasRegExpChar.test(string))
    ? string.replace(reRegExpChar, '\\$&')
    : string
}

var createMatcher = function(prefix, rest) {
  if (!prefix && !rest) {
    throw new Error('should be prefix or rest')
  }

  if (!rest) {
    return {
      regexp: new RegExp(escapeRegExp(prefix)),
      has_group: false,
    }
  }

  var paramsRegExp = '(.+?)'

  if (!prefix) {
    return {
      regexp: new RegExp(paramsRegExp),
      has_group: true,
    }
  }

  return {
    regexp: new RegExp(escapeRegExp(prefix) + paramsRegExp),
    has_group: true,
  }

}

var parse = function(full_usable_string) {
  // tracks/[:artist],[:track]
  var iterableCopy = new RegExp(string_state_regexp.source, string_state_regexp.flags)
  var cur_matches
  var parts = []
  var cur_matching_group = 1 // 0 is whole match
  var prev_have_state = false
  do {
    cur_matches = iterableCopy.exec(full_usable_string)

    if (!cur_matches) {
      break
    }

    var prefix = cur_matches[PREFIX]
    var state_source = cur_matches[STATE_SOURCE]

    if (!state_source) {
      var alternative = cur_matches[ALTERNATIVE]
      parts.push({
        prefix: alternative,
        state: null,
        state_source: null,
        matching_group: null,
        matcher: createMatcher(alternative, false)
      })
      prev_have_state = false
      continue
    }

    var state_dcl = cur_matches[STATE]
    var matching_group = cur_matching_group

    if (!prefix && prev_have_state) {
      var prev = parts[parts.length - 1]
      throw new Error(
        'Should be any separator between ' +
        prev.state_source + ' and ' + state_source + '.' +
        'Use comma, space, minus, plus, underscore'
      )
    }

    parts.push({
      prefix: prefix,
      state: stateItem(state_dcl),
      state_source: state_source,
      matching_group: matching_group,
      matcher: createMatcher(prefix, true),
    })
    cur_matching_group = cur_matching_group + 1
    prev_have_state = true
  } while (cur_matches)

  // TODO: check if two parts with state have separator
  // TODO: check to have only uniq params

  var fullRegExpString = '^'
  for (var i = 0; i < parts.length; i++) {
    fullRegExpString += parts[i].matcher.regexp.source
  }

  fullRegExpString += '$'

  return {
    parts: parts,
    matcher: new RegExp(fullRegExpString),
  }
}

return parse
})
