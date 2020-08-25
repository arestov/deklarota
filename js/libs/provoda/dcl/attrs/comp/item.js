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

var emptyList = []

var CompxAttrDecl = function(comlx_name, cur) {
  if (!Array.isArray(cur)) {
    throw new Error('don\'t use object structure of dep')
  }

  var deps_list = cur[0] || emptyList
  var fn = cur[1]

  if (!deps_list.length && typeof fn !== 'function') {
    throw new Error('use attr "input" to define default values')
  }

  this.fn = fn || identical


  if (!Array.isArray(deps_list)) {
    throw new Error('should be list')
  }

  var parsed = toParsedDeps(deps_list)

  this.addrs = parsed.fixed_deps
  this.depends_on = parsed.fixed_deps.map(shortStringWhenPossible)
  this.require_marks = parsed.require_marks

  this.name = comlx_name

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
