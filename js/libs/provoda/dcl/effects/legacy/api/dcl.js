

import usedInterfaceAttrName from '../../usedInterfaceAttrName'
import wrapDeps from './utils/wrapDeps'

const wrapInterfaceAttrs = function(arr) {
  const result = new Array(arr.length)
  for (let i = 0; i < arr.length; i++) {
    result[i] = usedInterfaceAttrName(arr[i])
  }
  return result
}

const attrToList = (str) => {
  if (typeof str == 'string') {
    return [str]
  }

  return str
}

const assignPropsFromData = function(self, data) {

  if (typeof data == 'function') {
    self.fn = data
    return
  }

  switch (data.length) {
    case 2: {
      const attr_deps = data[0]

      const all_deps = wrapDeps(attr_deps)
      // var all_deps_name = '_api_all_needs_' + name
      self.deps_name = '$meta$apis$' + self.name + '$deps_ready' // Symbol(all_deps_name)

      self.fn = data[1]
      self.all_deps = all_deps
    }
      break
    case 3:
    case 4: {
      const attr_deps = data[0]
      const needed_apis = data[1]

      self.needed_apis = needed_apis

      const needed_apis_deps = wrapInterfaceAttrs(needed_apis)

      const all_deps = wrapDeps([...attrToList(attr_deps), ...attrToList(needed_apis_deps)])
      // var all_deps_name = '_api_all_needs_' + name
      self.deps_name = '$meta$apis$' + self.name + '$deps_ready' // Symbol(all_deps_name)
      self.all_deps = all_deps

      self.fn = data[2]
      self.destroy = data[3]
    }
      break
  }
}

export default function ApiDeclr(name, data) {
  this.name = name

  this.fn = null

  this.needed_apis = null

  this.deps_name = null

  this.all_deps = null

  assignPropsFromData(this, data)


  Object.seal(this)
}
