
import spv from '../../../../../spv'
import indexByDepName from './utils/indexByDepName'
import getDepsToInsert from './utils/getDepsToInsert'

var usualApis = function(obj) {
  if (!obj) {
    return
  }

  var result = []

  for (var name in obj) {
    if (!obj.hasOwnProperty(name)) {
      continue
    }
    var cur = obj[name]
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

    var acc = input_acc
    for (var api_name in apis_index) {
      if (!apis_index.hasOwnProperty(api_name)) {
        continue
      }
      var api = apis_index[api_name]
      if (!api || !api.needed_apis) {
        continue
      }

      acc = fn(acc, api)

    }

    return acc
  }
}

var rootApis = checkApi(function(acc, api) {

  for (var i = 0; i < api.needed_apis.length; i++) {
    var cur = api.needed_apis[i]
    if (!spv.startsWith(cur, '#')) {
      continue
    }
    acc.push(cur.slice(1))
  }

  return acc
})

var notEmpty = function(input) {
  if (!input || !input.length) {
    return null
  }

  return input
}

var needSelf = checkApi(function(acc, api) {
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


export default function rebuild(self, apis, typed_state_dcls) {
  var inserted_names = getDepsToInsert(apis, self, typed_state_dcls)
  self.__defined_api_attrs_bool = inserted_names.map(wrapAttr)

  self.__apis_$_index = indexByDepName(apis) || self.__apis_$_index
  self.__apis_$_usual = usualApis(apis) || self.__apis_$_usual
  self.__apis_$__needs_root_apis = notEmpty(rootApis(apis, [])) || null
  self.__apis_$__needs_self = needSelf(apis, false)
}
