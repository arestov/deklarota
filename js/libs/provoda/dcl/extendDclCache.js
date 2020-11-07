import copyProps from './copyProps'

const extendDclCache = function(self, field, added) {
  const result = copyProps(self[field], added)
  if (self[field] === result) {
    return
  }
  self[field] = result
}


export default extendDclCache
