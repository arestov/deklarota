
function isSimpleObject(obj) {
  if (obj == null) {
    return false
  }

  // Allow arrays!
  if (Array.isArray(obj)) {
    return true
  }

  if (typeof obj != 'object') {
    return false
  }

  if (obj.constructor != Object) {
    // Don't allow custom instances like Date, URL, etc...
    return false
  }

  return true
}

function shallowEqual(objA, objB) {
  if (!isSimpleObject(objA) || !isSimpleObject(objB)) {
    return false
  }

  const a_is_arr = Array.isArray(objA)
  const b_is_arr = Array.isArray(objB)
  if (a_is_arr != b_is_arr) {
    return false
  }

  if (a_is_arr && objA.length != objB.length) {
    return false
  }

  /*
    fast check. just 1st level of props
  */

  for (var name in objA) {
    if (objA.hasOwnProperty(name)) {
      if (objA[name] !== objB[name]) {
        return false
      }
    }
  }

  // objA and objB can have dirrenent keys number. so check both

  for (var name in objB) {
    if (objB.hasOwnProperty(name)) {
      if (objB[name] !== objA[name]) {
        return false
      }
    }
  }

  return true
}

export default shallowEqual
