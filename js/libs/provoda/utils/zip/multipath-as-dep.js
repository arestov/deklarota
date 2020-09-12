var emptyArray = Object.freeze([])

var useSharedEmpty = function(list) {
  if (list != null && !list.length) {
    return emptyArray
  }

  return list
}

var zip_fns = {
  'one': function(list) {
    return list && list[0]
  },
  'every': function(list) {
    return list && list.every(Boolean)
  },
  'some': function(list) {
    return list && list.some(Boolean)
  },
  'find': function(list) {
    return list && list.find(Boolean)
  },
  'filter': function(list) {
    return list && useSharedEmpty(list.filter(Boolean))
  },
  'all': function(list) {
    return useSharedEmpty(list)
  },
  'length': function(list) {
    return list && list.length
  },
  'notEmpty': function(list) {
    return Boolean(list && list.length)
  },
}

export default zip_fns
