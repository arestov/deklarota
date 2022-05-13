import getParsedState from '../../../utils/getParsedState'
import fromLegacy from '../../../utils/multiPath/fromLegacy'
import parse from '../../../utils/multiPath/parse'
import sameArrayIfEmpty from '../../../utils/sameArrayIfEmpty'
import asString from '../../../utils/multiPath/asString'
import relReqMetaTypes from '../../../FastEventor/nestReqTypes'
// import attrReqMetaTypes from '../../../FastEventor/stateReqTypes'
import sameName from '../../../sameName'
import isBoolCompAttr from './isBoolCompAttr'
import shortStringWhenPossible from '../../../utils/multiPath/shortStringWhenPossible'

const identical = function(state) {
  return state
}



const toAddr = function(state_name) {
  const result1 = getParsedState(state_name)
  if (result1) {
    const nice = fromLegacy(state_name)
    const best = asString(nice)
    throw new Error('replace ' + state_name + ' by ' + best)

    return nice
  }

  const addr = parse(state_name)
  if (addr) {
    return addr
  }

  // it could be $meta or __, or anything else
  const last_result = parse.simpleState(state_name)
  return last_result
}

const toParsedDeps = function(array) {
  const result = new Array(array.length)
  const require_marks = []
  for (let i = 0; i < array.length; i++) {
    const cur = array[i]

    if (cur.charAt(0) != '&') {
      result[i] = toAddr(cur)
      continue
    }

    result[i] = toAddr(cur.slice(1))
    require_marks.push(i)
  }

  Object.freeze(result)
  Object.freeze(require_marks)

  return Object.freeze({fixed_deps: result, require_marks: sameArrayIfEmpty(require_marks)})
}

const emptyList = []

const badAttrs = new Set(['main_list_loading', 'list_loading', 'all_data_loaded'])
const ignoredLegacy = new Set(['list_loading', 'can_load_data', 'can_load_more', 'more_load_available'])

const CompxAttrDecl = function(comlx_name_raw, cur) {
  const comlx_name = sameName(comlx_name_raw)

  if (!Array.isArray(cur)) {
    throw new Error('don\'t use object structure of dep')
  }

  const deps_list = cur[0] || sameArrayIfEmpty(emptyList)
  const fn = cur[1]


  if (!deps_list.length && typeof fn !== 'function') {
    throw new Error('use attr "input" to define default values')
  }

  this.fn = fn || identical


  if (!Array.isArray(deps_list)) {
    throw new Error('should be list')
  }

  const params = cur[2]

  this.is_bool = isBoolCompAttr(params)

  Object.freeze(deps_list)

  const parsed = toParsedDeps(deps_list)

  this.addrs = parsed.fixed_deps
  Object.freeze(this.addrs)

  this.depends_on = parsed.fixed_deps.map(shortStringWhenPossible)
  Object.freeze(this.depends_on)

  this.require_marks = parsed.require_marks
  Object.freeze(this.require_marks)

  this.name = comlx_name

  this.watch_list = this.depends_on

  Object.freeze(this)


  if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
    return this
  }

  if (this.name == '_api_all_needs__') {
    return this
  }


  for (let i = 0; i < this.addrs.length; i++) {
    const addr = this.addrs[i]
    const str = addr.state && addr.state.base

    if (!str || str.startsWith('$meta$')) {
      continue
    }

    if (str.includes('$')) {
      console.warn('👺', 'dont-use-legacy-meta', this.name, str, new Error())
    }

    if (str.lastIndexOf('__') > 0) {
      console.warn('👺', 'dont-use-legacy-meta', this.name, str, new Error())
    }

    if (str.startsWith('_api_used_') && !this.name.startsWith('_apis_need')) {
      console.warn('🤖', 'dont-use-legacy-meta', this.name, str, '$meta$apis$' + str.replace('_api_used_', '') + '$used', new Error())
    }


    if (str.startsWith(relReqMetaTypes.loading_nesting)) {
      console.warn('🤖', 'dont-use-legacy-meta', this.name, str, new Error())
    }

    if (badAttrs.has(str) && !ignoredLegacy.has(this.name)) {
      console.warn('⚡', 'dont-use-legacy-meta', this.name, str, new Error())
    }
  }


  return this
}

export default CompxAttrDecl
