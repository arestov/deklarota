
import pvState from '../state'


const getOneValue = function(dep, item) {
  if (!item) {
    return item
  }

  if (dep.result_type != 'state') {
    return item
  }

  return pvState(item, dep.state.path)
}

const mapList = function(dep, list) {
  const result = new Array(list.length)
  for (let i = 0; i < list.length; i++) {
    result[i] = getOneValue(dep, list[i])
  }
  return result
}

const zip_fns = {
  'one': function(list, dep) {
    return list && getOneValue(dep, list[0])
  },
  'every': function(list, dep) {
    return list && mapList(dep, list).every(Boolean)
  },
  'some': function(list, dep) {
    return list && mapList(dep, list).some(Boolean)
  },
  'find': function(list, dep) {
    return list && mapList(dep, list).find(Boolean)
  },
  'filter': function(list, dep) {
    return list && mapList(dep, list).filter(Boolean)
  },
  'all': function(list, dep) {
    return list && mapList(dep, list)
  },
  'length': function(list) {
    return list && list.length
  },
  'notEmpty': function(list) {
    return Boolean(list && list.length)
  },

}

export default zip_fns
