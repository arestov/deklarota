
import spv from '../../../../../spv'
import morphMap from '../../../../../spv/morphMap'
import emptyArray from '../../../../emptyArray'
import parseAddr from '../../../../utils/multiPath/parse'
import { readingDeps } from '../../../../utils/multiPath/readingDeps/readingDeps'
import shortStringWhenPossible from '../../../../utils/multiPath/shortStringWhenPossible'
import _updateAttr from '../../../../_internal/_updateAttr'
import wrapDeps from '../api/utils/wrapDeps'
import getDclInputApis from '../utils/getDclInputApis'
const toRealArray = spv.toRealArray

const wrapByInput = (dcl, fn) => {
  if (dcl.apis_as_input === false) {
    return (self, result) => {
      self.nextTick(fn, [self, result])
    }
  }

  return (self, result) => {
    self.inputFromInterface(getDclInputApis(self, dcl), () => {
      fn(self, result)
    })
  }
}


const getHandler = function(schema) {
  const parse = typeof schema === 'object' && morphMap(schema)
  const is_one_field = typeof schema === 'string'

  if (is_one_field) {
    return wrapByInput(function(self, result) {
      _updateAttr(self, schema, result)
    })
  }
  return wrapByInput(function(self, result) {
    self.updateManyStates(parse(result))
  })
}

const getDeps = readingDeps()

const convertToProperPaths = (str) => {
  const addr = parseAddr(str)
  if (!addr) {
    return str
  }
  return shortStringWhenPossible(addr)
}

const toCorrectAttrs = (deps) => {
  return Object.freeze(toRealArray(deps).map(convertToProperPaths))
}

export default function ApiEffectDeclr(name, data) {

  this.name = name
  this.apis = null
  this.apis_as_input = null

  this.triggering_states = null
  this.deps = null
  this.deps_name = null
  this.result_schema = null
  this.is_async = null
  this.result_handler = null

  this.all_deps = null

  if (Array.isArray(data)) {
    throw new Error('use object for effect')
  }

  this.apis = toRealArray(data.api)
  this.apis_as_input = data.apis_as_input == null ? null : data.apis_as_input
  this.triggering_states = toCorrectAttrs(data.trigger)
  this.create_when_api_inits = data.create_when?.api_inits
  this.create_when_becomes_ready = data.create_when?.becomes_ready ?? true

  if (Array.isArray(data.fn)) {
    const [fn_deps, fn] = data.fn
    this.fn_deps = getDeps(fn_deps)
    this.fn = fn
  } else {
    this.fn_deps = null
    this.fn = data.fn
  }

  this.is_async = data.is_async
  this.result_handler = data.parse && getHandler(this.is_async, data.parse)

  if (data.require) {
    this.deps = wrapDeps(toCorrectAttrs(data.require))
    // var desc = '_need_api_effect_' + name
    this.deps_name = Symbol() // || Symbol(desc)

    this.all_deps = this.deps
  }

  if (data.effects) {
    throw new Error('effects as dep of out.effect is deprecated')
  }
}

export const getEffectsTriggeringAttrs = (source)=> {
  if (!source) {return emptyArray}

  const result = []

  for (const name in source) {
    if (!source.hasOwnProperty(name)) {continue}

    const cur = source[name]

    if (cur.triggering_states) {
      Array.prototype.push.apply(result, cur.triggering_states)
    }
  }

  for (const prop of Object.getOwnPropertySymbols(source)) {
    const cur = source[prop]

    if (cur.triggering_states) {
      Array.prototype.push.apply(result, cur.triggering_states)
    }
  }

  //: CompAttr
  return result
}
