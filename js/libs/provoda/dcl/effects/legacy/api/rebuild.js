
import spv from '../../../../../spv'
import indexByDepName from './utils/indexByDepName'
import parseCompItems from '../../../attrs/comp/parseItems'
import getDepsToInsert from './utils/getDepsToInsert'
import usedInterfaceAttrName from '../../usedInterfaceAttrName'
import { hasOwnProperty } from '../../../../hasOwnProperty'
import { fxByNameP } from '../../fxP'

const usualApis = function(obj) {
  if (!obj) {
    return
  }

  const result = []

  for (const name in obj) {
    if (!obj.hasOwnProperty(name)) {
      continue
    }
    const cur = obj[name]
    if (cur.deps_name) {
      continue
    }

    result.push(cur)
  }

  for (const prop of Object.getOwnPropertySymbols(obj)) {
    const cur = obj[prop]
    if (cur.deps_name) {
      continue
    }

    result.push(cur)
  }

  return result
}

function checkApi(fn) {
  return function(apis_index, input_acc) {
    if (!apis_index) {return}

    let acc = input_acc
    for (const api_name in apis_index) {
      if (!apis_index.hasOwnProperty(api_name)) {
        continue
      }
      const api = apis_index[api_name]
      if (!api || !api.needed_apis) {
        continue
      }

      acc = fn(acc, api)

    }

    for (const prop of Object.getOwnPropertySymbols(apis_index)) {
      const api = apis_index[prop]
      if (!api || !api.needed_apis) {
        continue
      }

      acc = fn(acc, api)
    }

    return acc
  }
}

const rootApis = checkApi(function(acc, api) {

  for (let i = 0; i < api.needed_apis.length; i++) {
    const cur = api.needed_apis[i]
    if (!spv.startsWith(cur, '#')) {
      continue
    }
    acc.push(cur.slice(1))
  }

  return acc
})

const notEmpty = function(input) {
  if (!input || !input.length) {
    return null
  }

  return input
}

const needSelf = checkApi(function(acc, api) {
  return acc || api.needed_apis.indexOf('self') != -1
})

function BooleanAttr(name) {
  this.name = name
}

BooleanAttr.prototype = {
  type: 'bool',
}

function wrapAttr(name) {
  return new BooleanAttr(name)
}


function getBoolAttrs(apis) {
  const bool_attrs = []
  for (const api_name in apis) {
    if (!hasOwnProperty(apis, api_name)) {
      continue

    }
    const api = apis[api_name]
    bool_attrs.push(wrapAttr(usedInterfaceAttrName(api.name)))
    if (api.deps_name) {
      bool_attrs.push(wrapAttr(api.deps_name))
    }
  }

  return bool_attrs
}

const apis_prop = fxByNameP('api-')

export const __defined_api_attrs_bool = [
  [apis_prop],
  (apis) => {
    return getBoolAttrs(apis)
  }
]

export const ___dcl_eff_api = [
  [apis_prop],
  (apis) => {
    const extended_comp_attrs = {}
    getDepsToInsert(apis, extended_comp_attrs)
    parseCompItems(extended_comp_attrs)
    return extended_comp_attrs
  },
]

export const __apis_$_index = [
  [apis_prop],
  (apis) => indexByDepName(apis),
]

export const __apis_$_usual = [
  [apis_prop],
  apis => usualApis(apis),
]

export const __apis_$__needs_root_apis = [
  [apis_prop],
  apis => notEmpty(rootApis(apis, [])),
]

export const __apis_$__needs_self = [
  [apis_prop],
  apis => needSelf(apis, false),
]


const depApis = (mut_result, list) => {
  if (!list) {return}

  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    mut_result[usedInterfaceAttrName(cur)] = null
  }
}

export const $attrs$from_apis$expected_input = [
  [apis_prop],
  obj => {
    const result = {}

    for (const name in obj) {
      if (!obj.hasOwnProperty(name)) {
        continue
      }
      const cur = obj[name]
      result[usedInterfaceAttrName(cur.name)] = null
      depApis(result, cur.needed_apis)
    }

    for (const prop of Object.getOwnPropertySymbols(obj)) {
      const cur = obj[prop]
      result[usedInterfaceAttrName(cur.name)] = null
      depApis(result, cur.needed_apis)
    }

    return result
  },
]
