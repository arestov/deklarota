

import wrapDeps from './utils/wrapDeps'

var prefixArray = function(arr, prefix) {
  var result = new Array(arr.length)
  for (var i = 0; i < arr.length; i++) {
    result[i] = prefix + arr[i]
  }
  return result
}

export default function ApiDeclr(name, data) {
  this.name = name

  this.fn = null

  this.needed_apis = null

  this.deps_name = null

  this.compxes = null

  if (typeof data == 'function') {
    this.fn = data
  } else {
    switch (data.length) {
      case 2: {
        var attr_deps = wrapDeps(data[0])

        var all_deps = attr_deps
        var all_deps_name = '_api_all_needs_' + name
        this.deps_name = all_deps_name

        this.fn = data[1]
        this.compxes = [
          this.deps_name, all_deps,
        ]
      }
      break
      case 3:
      case 4: {
        var attr_deps = wrapDeps(data[0])
        var attr_deps_name = '_triggered_api_' + name

        var needed_apis = data[1]
        this.needed_apis = needed_apis
        var needed_apis_dep = wrapDeps(prefixArray(needed_apis, '_api_used_'))
        var needed_apis_dep_name = '_apis_need_for_' + name

        var all_deps = wrapDeps([attr_deps_name, needed_apis_dep_name])
        var all_deps_name = '_api_all_needs_' + name
        this.deps_name = all_deps_name

        this.compxes = [
          attr_deps_name, attr_deps,
          needed_apis_dep_name, needed_apis_dep,
          this.deps_name, all_deps
        ]

        this.fn = data[2]
        this.destroy = data[3]
      }
      break
    }

  }

  Object.seal(this)
}
