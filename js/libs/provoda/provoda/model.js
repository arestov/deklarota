import merge from './dcl/merge'
import bhv from './bhv'
import inputAttrs from './dcl/attrs/input'

const model = (dcls) => {
  if (Array.isArray(dcls)) {
    return bhv(merge(...dcls))
  }


  return bhv(dcls)
}

const comp = Object.freeze({
  every: function(...args) {
    return args.every(Boolean)
  },
  some: function(...args) {
    return args.some(Boolean)
  },
  bool: Boolean,
  cond: function(cond, branch1, branch2) {
    return cond ? branch1 : branch2
  }
})

const attrs = Object.freeze({
  input: inputAttrs
})

export {
  comp,
  attrs,
}


export default model
