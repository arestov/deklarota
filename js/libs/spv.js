
import cloneObj from './spv/cloneObj.js'
import memorize from './spv/memorize'
import coe from './spv/coe'
import Class from './spv/Class'
import inh from './spv/inh'
import splitByDot from './spv/splitByDot'

const spv = {}

let addEvent
let removeEvent
let getFields
let getStringPattern
let toRealArray
let getTargetField
let sortByRules
let makeIndexByField
let $filter
let getUnitBaseNum
let debounce
let throttle

spv.getArrayNoDubs = function(array, clean_array) {
  clean_array = clean_array || []
  for (let i = 0; i < array.length; i++) {
    if (clean_array.indexOf(array[i]) == -1) {
      clean_array.push(array[i])
    }
  }
  return clean_array
}

spv.once = function(fn) {
  let result
  return function() {
    if (fn) {
      const fnn = fn
      fn = null
      return (result = fnn.apply(this, arguments))
    } else {
      return result
    }
  }
}

spv.mapfn = function(func) {
  return function(array) {
    if (!array) {return array}
    const result = new Array(array.length)
    for (let i = 0; i < array.length; i++) {
      result[i] = func(array[i], i)
    }
    return result
  }
}

const hasArg = function(el) {return el}
spv.hasEveryArgs = function() {
  return Array.prototype.every.call(arguments, hasArg)
}
spv.getExistingItems = function(arr) {
  const result = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      result.push(arr[i])
    }
  }
  return result
}

addEvent = spv.addEvent = function(elem, evType, fn) {
  elem.addEventListener(evType, fn, false)
  return fn
}
removeEvent = spv.removeEvent = function(elem, evType, fn) {
  if (!elem.removeEventListener) {
    return
  }
  elem.removeEventListener(evType, fn, false)
}

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
    var f = function() {
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

spv.doesContain = function(target, valueOf) {
  const cached_t_value = valueOf ? valueOf.call(target) : (target.valueOf())

  for (let i = 0; i < this.length; i++) {
    if (valueOf) {
      if (valueOf.call(this[i]) == cached_t_value) {
        return i
      }
    } else{
      if (this[i].valueOf() == cached_t_value) {
        return i
      }
    }


  }
  return -1
}
spv.hasCommonItems = function(arr1, arr2) {
  if (!arr2) {
    return false
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(arr1[i]) != -1) {
      return true
    }
  }
  return false
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

spv.arrayExclude = function arrayExclude(arr, obj) {
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

getTargetField = function getTargetField(obj, path) {
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

getFields = function(obj, fields) {
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
spv.getDiffObj = function(one, two) {
  let
    i
  const diff = {}
  const all_props = {}

  for (i in one) {
    all_props[i] = true
  }
  for (i in two) {
    all_props[i] = true
  }

  for (i in all_props) {
    if (one[i] !== two[i]) {
      diff[i] = two[i]
    }
  }
  return diff
}

spv.matchWords = function(source, query) {
  const words = query.split(/[\s\.\—\-\—\–\_\|\+\(\)\*\&\!\?\@\,\\\/\❤\♡\'\"\[\]]+/gi)
  const r = {}
  if (words.length) {
    r.forward = true
    let any_order = true
    const source_sliced = source
    for (var i = 0; i < words.length; i++) {
      const index = source_sliced.indexOf(words[i])
      if (index != -1) {
        source_sliced.slice(index + words[i].length)
      } else {
        r.forward = false
        break
      }
    }
    if (!r.forward) {
      for (var i = 0; i < words.length; i++) {
        if (source.indexOf(words[i]) == -1) {
          any_order = false
          break
        }
      }
    }
    r.any = any_order
  }
  return r
}

spv.searchInArray = function(array, query, fields) {
  query = getStringPattern(query)
  let r
  let i
  let cur

  if (query) {
    r = []

    if (fields) {
      for (i = 0; i < array.length; i++) {
        cur = array[i]
        const fields_values = getFields(cur, fields)
        if (fields_values.join(' ').search(query) > -1) {
          r.push(cur)
        }

      }
    } else{
      for (i = 0; i < array.length; i++) {
        cur = array[i]
        if (typeof cur == 'string' && cur.search(query) > -1) {
          r.push(cur)
        }
      }
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

getStringPattern = function(str) {
  if (str.replace(/\s/g, '')) {

    str = escapeRegExp(str, true).split(/\s/g)
    for (let i = 0; i < str.length; i++) {
      str[i] = '((^\|\\s)' + str[i] + ')'
    }
    str = str.join('|')

    return new RegExp(str, 'gi')
  }
}
spv.getStringPattern = getStringPattern

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

toRealArray = spv.toRealArray = function toRealArray(array, check_field) {
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

spv.f = {
  allOf: function() {
    // logical `and`, return last result of stop
    let i = 0
    const args = new Array(arguments.length - 1)
    for (i = 1; i < arguments.length; i++) {
      args[ i - 1 ] = arguments[i]
    }

    return function() {
      let result
      for (let i = 0; i < args.length; i++) {
        result = args[i].apply(this, arguments)
        if (!result) {
          return result
        }
      }
      return result
    }
  },
  firstOf: function() {
    // logical `or`, return first result of stop
    let i = 0
    const args = new Array(arguments.length - 1)
    for (i = 1; i < arguments.length; i++) {
      args[ i - 1 ] = arguments[i]
    }

    return function() {
      let result
      for (let i = 0; i < args.length; i++) {
        result = args[i].apply(this, arguments)
        if (result) {
          return result
        }
      }
      return result
    }
  },
}
const setTargetField = function(obj, tree, value) {
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

sortByRules = spv.sortByRules = function sortByRules(a, b, rules) {
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

spv.indexBy = function(array, field) {
  const index = {}
  if (!array || !array.length) {
    return index
  }

  for (let i = 0; i < array.length; i++) {
    const value = getTargetField(array[i], field)
    index[value] = array[i]
  }

  return index
}

spv.groupBy = function(array, field) {
  const index = {}
  if (!array || !array.length) {
    return index
  }

  for (let i = 0; i < array.length; i++) {
    const value = getTargetField(array[i], field)
    if (!index[value]) {
      index[value] = []
    }
    index[value].push(array[i])
  }

  return index
}

spv.getSortFunc = function(rules) {
  return function(a, b) {
    return sortByRules(a, b, rules)
  }
}

makeIndexByField = spv.makeIndexByField = function(array, field, keep_case) {
  const r = {}
  if (array && array.length) {
    for (let i = 0; i < array.length; i++) {
      var simple_name
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


$filter = function(array, field, value_or_testfunc) {
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

getUnitBaseNum = function(_c) {
  if (_c > 0) {
    if (_c > 10 && _c < 20) {
      return 2
    } else {
      let _cc = '0' + _c
      _cc = parseFloat(_cc.slice(_cc.length - 1))

      if (_cc === 0) {
        return 2
      } else if (_cc == 1) {
        return 0
      }else if (_cc < 5) {
        return 1
      } else {
        return 2
      }
    }
  } else if (_c === 0) {
    return 2
  }
}
spv.getUnitBaseNum = getUnitBaseNum

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

spv.passingContext = function passingContext(func) {
  // for legacy
  return function(obj) {
    const arr = new Array(arguments.length)
    for (let i = 0; i < arguments.length; i++) {
      arr[i] = arguments[i]
    }
    arr.shift()

    func.apply(obj, arr)
  }
}

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
debounce = function debounce(fn, timeout, invokeAsap, ctx) {

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

throttle = function throttle(fn, timeout, ctx) {

  let timer
  let args
  let needInvoke

  return function() {

    args = arguments
    needInvoke = true
    ctx = ctx || this

    if(!timer) {
      var wrap_func = function() {
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


const getFullFieldPath = function(last_part, data) {
  let cur = data
  const result = [last_part]
  while (cur && cur.prop_name) {
    result.unshift(cur.prop_name)
    cur = cur.parent
  }
  return result.join('.')
}


const getPropsListByTree = function(obj) {
  const all_objects = [{
    parent: null,
    prop_name: '',
    obj: obj
  }]
  let cur
  let i
  let prop_name
  const objects_list = []
  const result_list = []

  while (all_objects.length) {
    cur = all_objects.shift()
    for (prop_name in cur.obj) {
      if (!cur.obj.hasOwnProperty(prop_name) || !cur.obj[prop_name]) {
        continue
      }
      if (Array.isArray(cur.obj[prop_name])) {
        continue
      }
      if (typeof cur.obj[prop_name] == 'object') {
        all_objects.push({
          parent: cur,
          prop_name: prop_name,
          obj: cur.obj[prop_name]
        })
      }
    }
    objects_list.push(cur)
  }

  for (i = 0; i < objects_list.length; i++) {
    cur = objects_list[i]
    for (prop_name in cur.obj) {
      if (!cur.obj.hasOwnProperty(prop_name)) {
        continue
      }
      if (typeof cur.obj[prop_name] == 'string' || !cur.obj[prop_name] || Array.isArray(cur.obj[prop_name])) {
        result_list.push({
          field_path: getFullFieldPath(prop_name, cur),
          field_path_value: cur.obj[prop_name]
        })
      }
    }
  }
  return result_list


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
const parseMap = function(map) {

  //var root = map;

  const all_targets = [map]
  const full_list = []
  let cur
  let i

  while (all_targets.length) {
    cur = all_targets.shift()
    if (cur.parts_map) {
      for (const prop_name in cur.parts_map) {
        if (!cur.parts_map.hasOwnProperty(prop_name)) {
          continue
        }
        const child_part = cur.parts_map[prop_name]
        if (typeof child_part.props_map == 'string' && child_part.parts_map) {
          console.log(['you can not have parts in', child_part, 'since it is simple string from field:' + child_part.props_map])
          throw new Error('you can not have parts in this place since it is simple string from field:' + child_part.props_map)
        }
        all_targets.push(child_part)
      }
    }
    full_list.push(cur)
  }


  for (i = 0; i < full_list.length; i++) {
    cur = full_list[i]
    //cur.props_map

    if (typeof cur.props_map == 'object' && !Array.isArray(cur.props_map)) {
      const full_propslist = getPropsListByTree(cur.props_map)
    //	console.log(full_propslist);
      cur.props_map = full_propslist
    }

  }


  return map
  //'весь список подчинённостей';
  //''
}

const getPropValueByField = function(fpv, iter, scope, spec_data) {
  let source_data = scope
  let state_name = fpv
  const start_char = fpv.charAt(0)
  if (start_char == '^') {
    state_name = fpv.slice(1)
    let count = fpv.length - state_name.length
    while (count) {
      --count
      source_data = iter.parent_data
      if (!source_data) {
        break
      }
    }
    //states_of_parent[fpv] = this.prsStCon.parent(fpv);
  } else if (start_char == '@') {
    throw new Error('')
    //states_of_nesting[fpv] = this.prsStCon.nesting(fpv);
  } else if (start_char == '#') {
    state_name = fpv.slice(1)
    source_data = spec_data
    if (!spec_data) {
      throw new Error()
    }
    //states_of_root[fpv] = this.prsStCon.root(fpv);
  }
  return getTargetField(source_data, state_name)
}

const getComplexPropValueByField = function(fpv, scope, iter, spec_data, converters) {



  let cur_value


  if (typeof fpv == 'string') {
    cur_value = getPropValueByField(fpv, iter, scope, spec_data)
  } else if (Array.isArray(fpv)) {
    if (fpv.length > 1) {
      let convert = fpv[0]

      if (typeof convert == 'string') {
        convert = converters[convert]
      }

      cur_value = convert(fpv[1] && getPropValueByField(fpv[1], iter, scope, spec_data))
    } else {
      cur_value = fpv[0]
    }

  }
  return cur_value
}

const getTargetProps = function(obj, scope, iter, spec_data, converters) {
  for (let i = 0; i < iter.map_opts.props_map.length; i++) {
    const cur = iter.map_opts.props_map[i]

    let fpv = cur.field_path_value
    if (!fpv) {
      fpv = cur.field_path
    }

    const cur_value = getComplexPropValueByField(fpv, scope, iter, spec_data, converters)

    setTargetField(obj, cur.field_path, cur_value)
  }

}

const handlePropsMapScope = function(spec_data, cur, objects_list, scope, converters) {
  if (typeof cur.map_opts.props_map == 'string') {
    return getComplexPropValueByField(cur.map_opts.props_map, scope, cur, spec_data, converters)
  }

  const result_value_item = {}
  getTargetProps(result_value_item, scope, cur, spec_data, converters)

  for (const prop_name in cur.map_opts.parts_map) {
    //cur.map_opts.parts_map[prop_name];
    const map_opts = cur.map_opts.parts_map[prop_name]

    const result_value = map_opts.is_array ? [] : {} //объект используемый потомками создаётся в контексте родителя, что бы родитель знал о потомках
    setTargetField(result_value_item, prop_name, result_value)//здесь родитель записывает информацию о своих потомках

    objects_list.push({
      map_opts: map_opts,
      parent_data: scope,
      parent_map: cur.map_opts,
      writeable_array: result_value,

      data_scope: null
    })
  }
  return result_value_item
}

const executeMap = function(map, data, spec_data, converters) {

  const root_struc = {
    map_opts: map,
    parent_data: data,
    parent_map: null,
    writeable_array: map.is_array ? [] : {},
    //writeable_array - объект или массив объектов получающихся в результате парсинга одной из областей видимости
    //должен быть предоставлен потомку родителем

    data_scope: null
  }


  const objects_list = [root_struc]
  let result_item

  while (objects_list.length) {
    const cur = objects_list.shift()


    var cvalue
    if (cur.map_opts.source) {
      cvalue = getTargetField(cur.parent_data, cur.map_opts.source)
    } else {
      cvalue = cur.parent_data
    }

    if (!cvalue) {
      continue
    }

    if (!cur.map_opts.is_array) {
      cur.data_scope = cvalue
      result_item = handlePropsMapScope(spec_data, cur, objects_list, cur.data_scope, converters)
      if (typeof result_item != 'object') {
        throw new Error('use something more simple!')
      }
      cloneObj(cur.writeable_array, result_item)
    } else {
      cur.data_scope = toRealArray(cvalue)
      cur.writeable_array.length = cur.data_scope.length

      for (let i = 0; i < cur.data_scope.length; i++) {
        const scope = cur.data_scope[i]
        cur.writeable_array[i] = handlePropsMapScope(spec_data, cur, objects_list, scope, converters)


      }
    }




  }

  return root_struc.writeable_array
}


const MorphMap = function(config, converters) {
  if (config && typeof config != 'object') {
    throw new Error('map should be `object`')
  }
  this.config = config
  this.converters = converters
  this.pconfig = null

  const _this = this
  return function() {
    return _this.execute.apply(_this, arguments)
  }
}
MorphMap.prototype.execute = function(data, spec_data, converters) {
  if (!this.pconfig) {
    this.pconfig = parseMap(this.config)
  }
  return executeMap(this.pconfig, data, spec_data, converters || this.converters)
}

//var data_bymap = executeMap( parseMap(map), raw_testmap_data, {smile: '25567773'} );
//console.log(data_bymap);

spv.MorphMap = MorphMap
spv.mmap = function(config, converters) {
  return new MorphMap(config, converters)
}
//i should not rewrite fields




spv.coe = coe

const letter_regexp = /[^\u00C0-\u1FFF\u2C00-\uD7FF\w]/gi
//http://stackoverflow.com/questions/150033/regular-expression-to-match-non-english-characters#comment22322603_150078


const hardTrim = function(string) {
  return string.replace(letter_regexp, '').toLowerCase()
}
spv.hardTrim = hardTrim




spv.insertItem = function(array, item, index) {
  const array_length = array.length
  let next_value = item
  let value_to_recover

  for (let jj = index; jj < array_length + 1; jj++) {
    value_to_recover = array[jj]
    array[jj] = next_value
    next_value = value_to_recover
  }
  return array
}

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

let startsWith
if (String.prototype.startsWith) {
  startsWith = function(str, substr, pos) {
    return str.startsWith(substr, pos)
  }
} else {
  //http://jsperf.com/starts-with/14, without problems for GC
  startsWith = function(str, substr, pos) {
    const len = substr.length
    const shift = pos || 0

    for (let i = 0; i < len; i++) {
      if (str.charAt(i + shift) != substr.charAt(i)) {
        return false
      }
    }
    return true
  }
}

spv.startsWith = startsWith

let endsWith
if (String.prototype.endsWith) {
  endsWith = function(str, substr, pos) {
    return str.endsWith(substr, pos)
  }
} else {
  endsWith = function(str, substr, pos) {
    const len = substr.length
    const big_length_diff = (pos || str.length) - len

    for (let i = len; i > 0; i--) {
      if (str.charAt(big_length_diff + i - 1) !== substr.charAt(i - 1)) {
        return false
      }
    }
    return true
  }
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
