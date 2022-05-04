import followRelPath from '../../../../followRelPath'
import multiPathAsString from '../../../../utils/multiPath/asString'

const subscribe = function(md, target, state_name, full_name) {
  md.updateAttr(full_name, target.getAttr(state_name))
  md.wlch(target, state_name, full_name)
}

const unsubscribe = function(md, target, state_name, full_name) {
  md.unwlch(target, state_name, full_name)
}

const handleList = (handle) => (self) => {
  if (self.$view$externals_deps == null) {
    return
  }

  for (let i = 0; i < self.$view$externals_deps.length; i++) {
    const cur = self.$view$externals_deps[i]
    const source = followRelPath(self, cur.nesting.path)

    handle(self, source, cur.state.base, multiPathAsString(cur))
  }
}

export const connectViewExternalDeps = handleList(subscribe)
export const disconnectViewExternalDeps = handleList(unsubscribe)
