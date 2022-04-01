
// var spv = require('spv')

const string_state_regexp = /((.*?)(\[\:(.+?)\]))|(.+)/g
// 0:                     1:((2:)(3:(4:)))|(:5)
const PREFIX = 2
const STATE_SOURCE = 3
const STATE = 4
const ALTERNATIVE = 5

// Add optional params - 'tracks/[:artist:next_value],([:track])'
// Add optional values - 'tracks/[:artist::Smith],([:track])'

const stateItem = function(text) {
  const parts = text.split(':')
  const dest = parts[0]
  const source = parts[1] || dest
  const value = parts[2]
  if (value == '') {
    throw new Error('value can\'t be empty string')
  }
  if (value && parts[1]) {
    throw new Error('param should be empty when value exists')
  }
  return [dest, source, value]
}

const reRegExpChar = /[\\^$.*+?()[\]{}|]/g
const reHasRegExpChar = RegExp(reRegExpChar.source)


const escapeRegExp = function(string) {
  return (string && reHasRegExpChar.test(string))
    ? string.replace(reRegExpChar, '\\$&')
    : string
}

const createMatcher = function(prefix, rest) {
  if (!prefix && !rest) {
    throw new Error('should be prefix or rest')
  }

  if (!rest) {
    return {
      regexp: new RegExp(escapeRegExp(prefix)),
      has_group: false,
    }
  }

  const paramsRegExp = '(.+?)'

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

const parse = function(full_usable_string) {
  // tracks/[:artist],[:track]
  const iterableCopy = new RegExp(string_state_regexp.source, string_state_regexp.flags)
  let cur_matches
  const parts = []
  let cur_matching_group = 1 // 0 is whole match
  let prev_have_state = false
  do {
    cur_matches = iterableCopy.exec(full_usable_string)

    if (!cur_matches) {
      break
    }

    const prefix = cur_matches[PREFIX]
    const state_source = cur_matches[STATE_SOURCE]

    if (!state_source) {
      const alternative = cur_matches[ALTERNATIVE]
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

    const state_dcl = cur_matches[STATE]
    const matching_group = cur_matching_group

    if (!prefix && prev_have_state) {
      const prev = parts[parts.length - 1]
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

  let fullRegExpString = '^'
  for (let i = 0; i < parts.length; i++) {
    fullRegExpString += parts[i].matcher.regexp.source
  }

  fullRegExpString += '$'

  return {
    parts: parts,
    matcher: new RegExp(fullRegExpString),
  }
}

export default parse
