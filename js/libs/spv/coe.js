
import cloneObj from './cloneObj'

export default function(cb) {
  const result = {}
  const add = function(obj) {
    cloneObj(result, obj)
  }
  cb(add)
  return result
}
