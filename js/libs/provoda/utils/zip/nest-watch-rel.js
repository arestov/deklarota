

const arrayClone = function(array) {
  if (Array.isArray(array)) {
    return array.slice(0)
  } else {
    return array
  }
}

const oneFromArray = function(array) {
  if (Array.isArray(array)) {
    return array[0]
  }
  return array
}

const getLength = function(array) {
  if (Array.isArray(array)) {
    return array.length
  }

  return array ? 1 : 0
}

const notEmpty = function(array) {
  return Boolean(getLength(array))
}

export default {
  'all': arrayClone,
  'one': oneFromArray,
  'length': getLength,
  'notEmpty': notEmpty,
}
