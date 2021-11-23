
import spv from '../../../spv'
import pvState from '../state'

const stateOf = spv.memorize(function(state_name) {
  return function(md) {
    return pvState(md, state_name)
  }
})

const stateG = function(callback) {
  return function(state_name) {
    return callback(stateOf(state_name))
  }
}

const toZipFunc = function(toValue) {
  return spv.memorize(stateG(toValue))
}

const map = toZipFunc(function(state) {
  return function(array) {
    return array && array.map(state)
  }
})


const some = toZipFunc(function(state) {
  return function(array) {
    return array.some(state)
  }
})

const every = toZipFunc(function(state) {
  return function(array) {
    return array.every(state)
  }
})

const find = toZipFunc(function(state) {
  return function(array) {
    const item = array.find(state)
    return item && state(item)
  }
})

const filter = toZipFunc(function(state) {
  return function(array) {
    const list = array.filter(state)
    return list && list.map(state)
  }
})

const one = toZipFunc(function(state) {
  return function(array) {
    return array[0] && state(array[0])
  }
})

export default {
  'all': function(state_name) {
    return map(state_name)
  },
  'one': function(state_name) {
    return one(state_name)
  },
  'some': function(state_name) {
    return some(state_name)
  },
  'every': function(state_name) {
    return every(state_name)
  },
  'find': function(state_name) {
    return find(state_name)
  },
  'filter': function(state_name) {
    return filter(state_name)
  },
}
