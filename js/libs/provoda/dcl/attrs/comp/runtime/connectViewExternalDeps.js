import multiPathAsString from '../../../../utils/multiPath/asString'

const subscribe = function(md, target, state_name, full_name) {
  md.updateAttr(full_name, target.getAttr(state_name))
  md.wlch(target, state_name, full_name)
}

const unsubscribe = function(md, target, state_name, full_name) {
  md.unwlch(target, state_name, full_name)
}

const getRelStepModel = (from, step) => {
  switch (step) {
    case '$v_parent':
      return from.parent_view
  }
  console.warn('cant use this step', {step})
  throw new Error('cant use this step')
}

const followRelPath = (start, rel_path) => {
  let from = start
  for (let i = 0; i < rel_path.length; i++) {
    const cur = rel_path[i]
    from = getRelStepModel(from, cur)
  }
  return from
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
