import getShortStateName from '../../../utils/getShortStateName'
import getParsedState from '../../../utils/getParsedState'
import fromLegacy from '../../../utils/multiPath/fromLegacy'
import parse from '../../../utils/multiPath/parse'
import asString from '../../../utils/multiPath/asString'
import isJustAttrAddr from './isJustAttrAddr'

var shortStringWhenPossible = function(addr) {

  if (!isJustAttrAddr(addr)) {
    return asString(addr)
  }

  return addr.state.path
}

var identical = function(state) {
  return state
}


var fromArray = function(state_name, cur) {
  return {
    depends_on: cur[0] || [],
    fn: cur[1],
    name: state_name,
    watch_list: null
  }
}

var toAddr = function(state_name) {
  var result1 = getParsedState(state_name)
  if (result1) {
    var nice = fromLegacy(state_name)
    var best = asString(nice)
    console.warn('replace ' + state_name + ' by ' + best)

    return nice
  }

  var addr = parse(state_name)
  if (addr) {
    return addr
  }

  // it could be $meta or __, or anything else
  var last_result = parse.simpleState(state_name)
  return last_result
}

var toParsedDeps = function(array) {
  var result = new Array(array.length)
  var require_marks = []
  for (var i = 0; i < array.length; i++) {
    var cur = array[i]

    if (cur.charAt(0) != '&') {
      result[i] = toAddr(cur)
      continue
    }

    result[i] = toAddr(cur.slice(1))
    require_marks.push(i)
  }

  return {fixed_deps: result, require_marks: require_marks}
}

var CompxAttrDecl = function(comlx_name, cur) {
  var item = cur instanceof Array ? fromArray(comlx_name, cur) : cur
  var raw_depends_on = item.depends_on

  if (!Array.isArray(raw_depends_on)) {
    throw new Error('should be list')
  }

  var parsed = toParsedDeps(raw_depends_on)

  this.addrs = parsed.fixed_deps
  this.depends_on = parsed.fixed_deps.map(shortStringWhenPossible)
  this.require_marks = parsed.require_marks

  this.name = comlx_name

  if (!this.depends_on.length && typeof item.fn !== 'function') {
    throw new Error('use attr "input" to define default values')
  }

  this.fn = item.fn || identical

  if (!Array.isArray(this.depends_on)) {
    throw new Error('should be list: ' + this.depends_on)
  }

  this.watch_list = new Array(this.depends_on.length || 0)

  for (var i = 0; i < this.depends_on.length; i++) {
    if (!this.depends_on[i]) {
      throw new Error('state name should not be empty')
    }
    this.watch_list[i] = getShortStateName(this.depends_on[i])
  }
  return this
}

export default CompxAttrDecl
