
import spv from '../../../../../spv'
import indexByDepName from './utils/indexByDepName'
import cachedField from '../../../cachedField'
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

export const checkApiBools = cachedField('__defined_api_attrs_bool', [fxByNameP('api-')], false, (apis) => {
  return getBoolAttrs(apis)
})

export const checkAttrsFromApi = cachedField('___dcl_eff_api', [fxByNameP('api-')], false, (apis) => {
  const extended_comp_attrs = {}
  getDepsToInsert(apis, extended_comp_attrs)
  parseCompItems(extended_comp_attrs)
  return extended_comp_attrs
})

export default function rebuild(self, apis) {
  self.__apis_$_index = indexByDepName(apis) || self.__apis_$_index
  self.__apis_$_usual = usualApis(apis) || self.__apis_$_usual
  self.__apis_$__needs_root_apis = notEmpty(rootApis(apis, [])) || null
  self.__apis_$__needs_self = needSelf(apis, false)
}
