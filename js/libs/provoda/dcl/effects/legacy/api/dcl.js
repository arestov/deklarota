

import wrapDeps from './utils/wrapDeps'

var wrapInterfaceAttrs = function(arr) {
  var result = new Array(arr.length)
  for (var i = 0; i < arr.length; i++) {
    result[i] = '$meta$apis$' + arr[i] + '$used'
  }
  return result
}

const attrToList = (str) => {
  if (typeof str == 'string') {
    return [str]
  }

  return str
}

export default function ApiDeclr(name, data) {
  this.name = name

  this.fn = null

  this.needed_apis = null

  this.deps_name = null

  this.all_deps = null

  if (typeof data == 'function') {
    this.fn = data
  } else {
    switch (data.length) {
      case 2: {
        var attr_deps = data[0]

        var all_deps = wrapDeps(attr_deps)
        // var all_deps_name = '_api_all_needs_' + name
        this.deps_name = Symbol() // Symbol(all_deps_name)

        this.fn = data[1]
        this.all_deps = all_deps
      }
      break
      case 3:
      case 4: {
        var attr_deps = data[0]
        var needed_apis = data[1]

        this.needed_apis = needed_apis

        var needed_apis_deps = wrapInterfaceAttrs(needed_apis)

        var all_deps = wrapDeps([...attrToList(attr_deps), ...attrToList(needed_apis_deps)])
        // var all_deps_name = '_api_all_needs_' + name
        this.deps_name = Symbol() // Symbol(all_deps_name)
        this.all_deps = all_deps

        this.fn = data[2]
        this.destroy = data[3]
      }
      break
    }

  }

  Object.seal(this)
}
