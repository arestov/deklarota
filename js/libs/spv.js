
import Class from './spv/Class'
import cloneObj from './spv/cloneObj.js'
import coe from './spv/coe'
import inh from './spv/inh'
import memorize from './spv/memorize'
import splitByDot from './spv/splitByDot'

export const spv = {}

spv.getArrayNoDubs = function(array, clean_array) {
  clean_array = clean_array || []
  for (let i = 0; i < array.length; i++) {
    if (clean_array.indexOf(array[i]) == -1) {
      clean_array.push(array[i])
    }
  }
  return clean_array
}

const hasArg = function(el) {return el}
export const hasEveryArgs = function() {
  return Array.prototype.every.call(arguments, hasArg)
}

const addEvent = (elem, evType, fn) => {
  elem.addEventListener(evType, fn, false)
  return fn
}

const removeEvent = (elem, evType, fn) => {
  if (!elem.removeEventListener) {
    return
  }
  elem.removeEventListener(evType, fn, false)
}

spv.addEvent = addEvent
spv.removeEvent = removeEvent

spv.listenEvent = function(elem, evType, fn) {
  addEvent(elem, evType, fn)
  return function() {
    removeEvent(elem, evType, fn)
  }
}

spv.getDefaultView = function(d) {
  return d.defaultView || d.parentWindow
}

spv.domReady = function(d, callback) {
  const wndw = spv.getDefaultView(d)
  if (!wndw) {
    return
  }
  if (d.readyState == 'complete' || d.readyState == 'loaded' || d.readyState == 'interactive') {
    callback()
  } else{
    let done
    const f = function() {
      if (!done) {
        done = true
        spv.removeEvent(wndw, 'load', f)
        spv.removeEvent(d, 'DOMContentLoaded', f)
        callback()
      }
    }
    spv.addEvent(wndw, 'load', f)
    spv.addEvent(d, 'DOMContentLoaded', f)
  }
}

const arExclSimple = function(result, arr, obj) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== obj) {
      result.push(arr[i])
    }
  }
  return result
}
const arExclComplex = function(result, arr, obj) {
  for (let i = 0; i < arr.length; i++) {
    if (obj.indexOf(arr[i]) == -1) {
      result.push(arr[i])
    }
  }
  return result
}

export function arrayExclude(arr, obj) {
  const r = []
  if (!arr) {
    return r
  }

  if (Array.isArray(obj)) {
    return arExclComplex(r, arr, obj)
  } else {
    return arExclSimple(r, arr, obj)
  }
}
spv.arrayExclude = arrayExclude

spv.shuffleArray = function(obj) {
  const shuffled = []
  let rand
  let value
  for (let index = 0; index < obj.length; index++) {
    value = obj[index]
    rand = Math.floor(Math.random() * (index + 1))
    shuffled[index] = shuffled[rand]
    shuffled[rand] = value
  }
  return shuffled
}

spv.memorize = memorize

spv.splitByDot = splitByDot

const getFieldsTree = function getFieldsTree(string) {
  if (Array.isArray(string)) {
    return string
  } else {
    return splitByDot(string)
  }
}
spv.getFieldsTree = getFieldsTree

export const getTargetField = (obj, path) => {
  if (path == null) {return obj}
  if (obj == null) {return obj}

  const tree = getFieldsTree(path)
  let target = obj
  for (let i = 0; i < tree.length; i++) {
    if (target[tree[i]] != null) {
      target = target[tree[i]]
    } else{
      return
    }
  }
  return target
}

const getFields = function(obj, fields) {
  const r = []
  for (let i = 0; i < fields.length; i++) {
    const cur = fields[i]

    const value = (typeof cur == 'function') ? cur(obj) : getTargetField(obj, cur)
    if (value) {
      r.push(value)
    }
  }
  return r
}

const regexp_escaper = /([$\^*()+\[\]{}|.\/?\\])/g
const escapeRegExp = function(str, clean) {
  if (clean) {
    str = str.replace(/\s+/g, ' ').replace(/(^\s)|(\s$)/g, '') //removing spaces
  }
  return str.replace(regexp_escaper, '\\$1') //escaping regexp symbols
}

spv.escapeRegExp = escapeRegExp


spv.collapseAll = function() {
  const r = []
  for (let i = 0; i < arguments.length; i++) {
    const c = arguments[i]
    if (Array.isArray(c)) {
      for (let ii = 0; ii < c.length; ii++) {
        if (r.indexOf(c[ii]) == -1) {
          r.push(c[ii])
        }

      }
    } else {
      if (r.indexOf(c) == -1) {
        r.push(c)
      }
    }
  }
  return r
}

export const toRealArray = (array, check_field) => {
  if (Array.isArray(array)) {
    return array
  } else if (array && (typeof array == 'object') && array.length) {
    return Array.prototype.slice.call(array)
  } else if (array && (!check_field || getTargetField(array, check_field))) {
    return [array]
  } else{
    return []
  }
}

spv.toRealArray = toRealArray

export const setTargetField = function(obj, tree, value) {
  tree = getFieldsTree(tree)
  let cur_obj = obj
  for (let i = 0; i < tree.length; i++) {
    const cur = tree[i]
    if (i != tree.length - 1) {
      let target = cur_obj[cur]
      if (!target) {
        target = cur_obj[cur] = {}
      }
      cur_obj = target
    } else {
      cur_obj[cur] = value
    }
  }
  return true
}


spv.setTargetField = setTargetField

const getFieldValueByRule = function(obj, rule) {
  if (rule instanceof Function) {
    return rule(obj)
  } else if (Array.isArray(rule)) {
    return getTargetField(obj, rule)
  } else if (rule instanceof Object) {
    if (typeof rule.field == 'function') {
      return rule.field(obj)
    } else {
      return getTargetField(obj, rule.field)
    }
  } else{
    return getTargetField(obj, rule)
  }



}


spv.compareArray = function compareArray(one, two) {
  if (!one || !two) {
    if (!one && !two) {
      return
    }
    if (!one) {
      return 1
    }
    if (!two) {
      return -1
    }
  }
  const max = Math.max(one.length, two.length)
  for (let i = 0; i < max; i++) {
    const value_one = one[i]
    const value_two = two[i]
    if (value_one === value_two) {
      continue
    }

    if (value_one == null && value_two == null) {
      continue
    } else if (value_one == null) {
      return 1
    } else if (value_two == null) {
      return -1
    }

    if (value_one > value_two) {
      return 1
    }
    if (value_one < value_two) {
      return -1
    }
  }
}

const sortByRules = spv.sortByRules = function sortByRules(a, b, rules) {
  if (a instanceof Object && b instanceof Object) {
    let shift = 0

    for (let i = 0; i < rules.length; i++) {
      if (!shift) {
        const cr = rules[i]
        let field_value_a = getFieldValueByRule(a, cr)
        let field_value_b = getFieldValueByRule(b, cr)
        field_value_a = field_value_a || !!field_value_a //true > undefined == false, but true > false == true
        field_value_b = field_value_b || !!field_value_b //so convert every "", null and undefined to false


        if (field_value_a > field_value_b) {
          shift = cr.reverse ? -1 : 1
        } else if (field_value_a < field_value_b) {
          shift = cr.reverse ? 1 : -1
        }
      }

    }

    return shift

  }
}

const makeIndexByField = spv.makeIndexByField = function(array, field, keep_case) {
  const r = {}
  if (array && array.length) {
    for (let i = 0; i < array.length; i++) {
      let simple_name
      const cur = array[i]
      const fv = getTargetField(cur, field)
      if (fv || typeof fv == 'number') {
        if (fv instanceof Array) {
          for (let k = 0; k < fv.length; k++) {
            simple_name = (fv[k] + '')
            if (!keep_case) {
              simple_name = simple_name.toLowerCase()
            }
            if (!r[simple_name]) {
              r[simple_name] = []
              r[simple_name].real_name = fv[k]
            }
            if (r[simple_name].indexOf(cur) == -1) {
              r[simple_name].push(cur)
            }
          }
        } else{
          simple_name = (fv + '')
          if (!keep_case) {
            simple_name = simple_name.toLowerCase()
          }
          if (!r[simple_name]) {
            r[simple_name] = []
            r[simple_name].real_name = fv
          }
          if (r[simple_name].indexOf(cur) == -1) {
            r[simple_name].push(cur)
          }
        }
      } else {
        if (!r['#other']) {
          r['#other'] = []
        }
        if (r['#other'].indexOf(cur) == -1) {
          r['#other'].push(cur)
        }
      }
    }
  }
  return r
}


const $filter = function(array, field, value_or_testfunc) {
  let i
  const r = []
  r.not = []
  if (!array) {return r}

  if (value_or_testfunc) {
    for (i = 0; i < array.length; i++) {
      if (!array[i]) {
        continue
      }
      if (typeof value_or_testfunc == 'function') {
        if (value_or_testfunc(getTargetField(array[i], field))) {
          r.push(array[i])
        } else{
          r.not.push(array[i])
        }
      } else{
        if (getTargetField(array[i], field) === value_or_testfunc) {
          r.push(array[i])
        } else{
          r.not.push(array[i])
        }
      }
    }
  } else {
    for (i = 0; i < array.length; i++) {
      if (!array[i]) {
        continue
      }
      const field_value = getTargetField(array[i], field)
      if (field_value) {
        r.push(field_value)
      } else{
        r.not.push(array[i])
      }
    }
  }
  return r
}

spv.cloneObj = cloneObj

spv.stringifyParams = function(params, ignore_params, splitter, joiner, opts) {
  opts = opts || {}
  splitter = splitter || ''
  if (typeof params == 'string') {
    return params
  }
  const pv_signature_list = []
  for (const p in params) {
    if (!ignore_params || ignore_params.indexOf(p) == -1) {
      pv_signature_list.push(p + splitter + params[p])
    }
  }
  if (!opts.not_sort) {
    pv_signature_list.sort()
  }

  return pv_signature_list.join(joiner || '')
}


spv.Class = Class
spv.inh = inh


spv.precall = function precall(func1, func2) {
  // for legacy
  return function() {
    func1.apply(this, arguments)
    return func2.apply(this, arguments)
  }
}


/**
 * Debounce and throttle function's decorator plugin 1.0.5
 *
 * Copyright (c) 2009 Filatov Dmitry (alpha@zforms.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
const debounce = function debounce(fn, timeout, invokeAsap, ctx) {

  if(arguments.length == 3 && typeof invokeAsap != 'boolean') {
    ctx = invokeAsap
    invokeAsap = false
  }

  let timer

  return function() {

    const args = arguments
    const _this = this

    invokeAsap && !timer && fn.apply(ctx || this, args)

    clearTimeout(timer)

    timer = setTimeout(function() {
      !invokeAsap && fn.apply(ctx || _this, args)
      timer = null
    }, timeout)

  }

}

const throttle = function throttle(fn, timeout, ctx) {

  let timer
  let args
  let needInvoke

  return function() {

    args = arguments
    needInvoke = true
    ctx = ctx || this

    if(!timer) {
      const wrap_func = function() {
        if(needInvoke) {
          fn.apply(ctx, args)
          needInvoke = false
          timer = setTimeout(wrap_func, timeout)
        }
        else {
          timer = null
        }
      }
      wrap_func()
    }

  }

}
spv.capitalize = capitalize
function capitalize(string, just_first) {
  const test = just_first ? (/(^|\s)(.)/) : (/(^|\s)(.)/g)
  return string.replace(test, function(_m, p1, p2) {
    return p1 + p2.toUpperCase()
  })
}

spv.capitalize.fn = function(string) {
  return capitalize(string)
};

(function() {
  const splitter = new RegExp('\\%[^\\s\\%]+?\\%', 'gi')
  const var_name = new RegExp('\\%([^\\s\\%]+?)\\%')

  const pushName = function(obj, name, i) {
    if (!obj[name]) {
      obj[name] = []
    }
    obj[name].push(i)
  }
  const makeDom = function(d) {
    d = d || window.document
    for (let i = 0; i < this.length; i++) {
      if (this[i] && typeof this[i] == 'string') {
        this[i] = d.createTextNode(this[i])
      }
    }
    return this
  }
  const setVar = function(name, value) {

    for (let i = 0; i < this.vars[name].length; i++) {
      this[this.vars[name][i]] = value
    }

    return this
  }
  spv.createComlexText = function(text, not_make_dom) {
    const
      vars = text.match(splitter)
    const parts = text.split(splitter)
    const result = []

    result.vars = {}
    result.setVar = setVar
    result.makeDom = makeDom
    for (let i = 0; i < parts.length; i++) {
      result.push(parts[i])

      if (vars[i]) {
        const name = vars[i].match(var_name)[1]
        pushName(result.vars, name, result.length)
        result.push(null)
      }
    }
    if (!not_make_dom) {
      result.makeDom()
    }
    return result
  }

})()

spv.makeIndexByField = makeIndexByField
spv.getTargetField = getTargetField
spv.throttle = throttle
spv.debounce = debounce
spv.filter = $filter



spv.zerofyString = function(string, length) {
  if (typeof string != 'string') {
    string = '' + string
  }
  while (string.length < length) {
    string = '0' + string
  }
  return string
}


spv.mapProps = function mapProps(props_map, donor, acceptor) {
  for (const name in props_map) {
    const value = getTargetField(donor, props_map[name])
    if (typeof value != 'undefined') {
      setTargetField(acceptor, name, value)
    }
  }
  return acceptor
}
spv.coe = coe

const removeItem = function(array, index) {
  //var array_length = array.length;
  for (let i = index + 1; i < array.length; i++) {
    array[ i - 1 ] = array[ i ]
  }
  array.length = array.length - 1
  return array
}

spv.removeItem = removeItem

spv.findAndRemoveItem = function(array, item) {
  const index = array.indexOf(item)
  if (index === -1) {
    return array
  } else {
    return removeItem(array, index)
  }
}

const startsWith = function(str, substr, pos) {
  return str.startsWith(substr, pos)
}

spv.startsWith = startsWith

const endsWith = function(str, substr, pos) {
  return str.endsWith(substr, pos)
}

spv.endsWith = endsWith

spv.getDeprefixFunc = function(prefix, simple) {
  const cache = {}
  return function(namespace) {
    if (!cache.hasOwnProperty(namespace)) {
      if (startsWith(namespace, prefix)) {
        cache[namespace] = simple ? true : namespace.slice(prefix.length)
      } else {
        cache[namespace] = false
      }
    }
    return cache[namespace]
  }

}

spv.getPrefixingFunc = function(prefix) {
  const cache = {}
  return function(state_name) {
    if (!cache.hasOwnProperty(state_name)) {
      cache[state_name] = prefix + state_name
    }
    return cache[state_name]
  }
}

spv.forEachKey = function(obj, fn, arg1, arg2) {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {continue}
    fn(obj[key], key, arg1, arg2)
  }
}

export const isObjectEmpty = (obj) => {
  for (const prop in obj) {
    if (!obj.hasOwnProperty(prop)) {
      continue
    }

    return false
  }

  return true
}

export const countKeys = function(obj, truthy) {
  let count = 0
  for (const prop in obj) {
    if (!obj.hasOwnProperty(prop)) {
      continue
    }

    if (!truthy) {
      count++
    } else if (obj[prop]) {
      count++
    }
  }
  return count
}

spv.countKeys = countKeys

spv.nil = function(arg) {
  if (arg !== undefined && arg !== null) {
    return false
  }

  return true
}

spv.set = (function() {

  const Set = function() {
    this.list = []
    this.index = {}
  }


  return {
    contains: isInSet,
    get: getFromSet,
    add: AddToSet,
    remove: RemoveFromSet,
    create: create,
  }

  function getFromSet(set, key) {
    if (isInSet(set, key)) {return set.index[key]}
  }

  function isInSet(set, key) {
    return set.index.hasOwnProperty(key)
  }

  function AddToSet(set, key, item) {
    if (!item) {
      throw new Error('cant\'t add nothing')
    }

    if (isInSet(set, key)) {return item}

    set.index[key] = item
    set.list.push(item)

    return item
  }

  function RemoveFromSet(set, key) {
    const item = set.index[key]
    if (!isInSet(set, key)) {return}

    delete set.index[key]
    set.list = spv.findAndRemoveItem(set.list, item)
    return item
  }

  function create() {
    return new Set()
  }
})()


spv.getBoxedSetImmFunc = function getBoxedSetImmFunc(win) {
  return win.setImmediate || (function() {
    //http://learn.javascript.ru/setimmediate

    let head = {
      func: null,
      next: null
    }
    let tail = head // очередь вызовов, 1-связный список

    const ID = Math.random() // уникальный идентификатор

    const onmessage = function(e) {
      if (e.data != ID) {
        return
      } // не наше сообщение
      head = head.next
      const func = head.func
      head.func = null
      func()
    }

    if (win.addEventListener) { // IE9+, другие браузеры
      win.addEventListener('message', onmessage, false)
    } else { // IE8
      win.attachEvent('onmessage', onmessage)
    }

    return win.postMessage ? function(func) {
      if (!win || win.closed) {
        return
      }
      tail = tail.next = { func: func, next: null }
      win.postMessage(ID, '*')
    } :
      function(func) { // IE<8
        setTimeout(func, 0)
      }
  }())
}

Object.freeze(spv)

export default spv
