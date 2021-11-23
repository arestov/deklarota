
import spv from '../../../spv'
const startsWith = spv.startsWith

export default function(self, where) {
  if (!where) {
    return
  }
  if (Array.isArray(where)) {
    self.args_schema = getArgsSchema(where[0])

    if (typeof where[1] !== 'function') {
      throw new Error('where[1] should be func')
    }
    self.selectFn = where[1]
    self.where_states = where[0]
  } else if (typeof where == 'object') {
    const dcl = indexableQuery(where)
    useIndexableQuery(self, dcl)
  } else {
    throw new Error('unsupported type of where declaration')
  }
}

function isForDeep(name) {
  return startsWith(name, '>') && name.slice(1)
}

function getArgsSchema(list) {
  const args_schema = []
  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    const state_name = isForDeep(cur)
    if (state_name) {
      args_schema.push({
        type: 'deep',
        name: state_name
      })

    } else {
      args_schema.push({
        type: 'base',
        name: cur
      })

    }
  }
  return args_schema
}

function makeCompare(convert, compare) {
  return function(left, right) {
    return compare(convert(left), convert(right))
  }
}

function getOperatorFn(operator, convert) {
  switch (operator) {
    case '=': {
      return makeCompare(convert, function(left, right) {
        return left === right
      })
    }
    case '!=': {
      return makeCompare(convert, function(left, right) {
        return left !== right
      })
    }
    case '>': {
      return makeCompare(convert, function(left, right) {
        return left > right
      })
    }
    case '>=': {
      return makeCompare(convert, function(left, right) {
        return left >= right
      })
    }
    case '<': {
      return makeCompare(convert, function(left, right) {
        return left < right
      })
    }
    case '<=': {
      return makeCompare(convert, function(left, right) {
        return left <= right
      })
    }
    case 'regexp_match': {
      return makeCompare(convert, function(reg_exp, string) {
        return Boolean(reg_exp && reg_exp.match(string))
      })
    }
    case 'string_test': {
      return makeCompare(convert, function(string, reg_exp) {
        return Boolean(string && string.test(reg_exp))
      })
    }
    default: {
      throw new Error('unsupported operator ' + operator)
    }
  }
}

function getConvertor(convertor) {
  switch (convertor) {
    case 'boolean': {
      return function(value) {
        return Boolean(value)
      }
    }
    default: {
      throw new Error('unsupported convertor ' + convertor)
    }
  }
}

function same(value) {return value}

function getCompareFn(comparing) {
  if (typeof comparing == 'function') {
    return comparing
  }
  // convertor
  // operator
  const convert = comparing.convertor
    ? getConvertor(comparing.convertor)
    : same
  return getOperatorFn(comparing.operator, convert)
}

function bindArg(num) {
  return function() {
    return arguments[num]
  }
}

function bindCheck(dcl, args_to_states) {
  const getLeft = bindArg(args_to_states[dcl.compare_from])
  let getRight

  switch (dcl.criteria.type) {
    case 'state': {
      getRight = bindArg(args_to_states[dcl.criteria.state])
    }
      break
    case 'static_value': {
      const value = dcl.criteria.value
      getRight = function() {
        return value
      }
    }
      break
  }

  const compareFn = dcl.compareFn

  return function() {
    const left_value = getLeft.apply(null, arguments)
    const right_value = getRight.apply(null, arguments)

    return compareFn(left_value, right_value)
  }
}

function bindAnd(fn1, fn2) {
  return function() {
    return fn1.apply(null, arguments) && fn2.apply(null, arguments)
  }
}

function useIndexableQuery(self, dcl) {
  const list = []
  const args_to_states = {}

  function mapState(key) {
    if (args_to_states[key]) {return}

    list.push(key)
    args_to_states[key] = list.length - 1
  }

  const checks = []
  for (var i = 0; i < dcl.length; i++) {
    const cur = dcl[i]
    mapState(cur.compare_from)
    if (cur.criteria.type == 'state') {
      mapState(cur.criteria.state)
    }
    checks.push(bindCheck(cur, args_to_states))
  }


  let selectFn = checks[0]

  for (var i = 1; i < checks.length; i++) {
    selectFn = bindAnd(selectFn, checks[i])
  }

  self.args_schema = getArgsSchema(list)

  self.where_states = list
  self.selectFn = selectFn

}

function indexableQuery(query) {
  const items = []
  for (const prop in query) {
    const _cur = query[prop]
    var cur
    if (typeof _cur == 'string') {
      cur = ['=', _cur]
    } else if (Array.isArray(_cur)) {
      cur = _cur
    } else {
      throw new Error('does not support this kind of decraration')
    }
    const comparing = getComparing(cur[0])
    const criteria = getCriteriaValue(cur[1])
    items.push({
      compare_from: prop,
      comparing: comparing,
      criteria: criteria,
      compareFn: getCompareFn(comparing)
    })
  }
  if (!items.length) {
    throw new Error('where is empty')
  }
  return items
}

function getCriteriaValue(dcl) {
  if (typeof dcl == 'string') {
    return {
      type: 'state',
      state: dcl
    }
  } else if (Array.isArray(dcl) && dcl.length == 1) {
    return {
      type: 'static_value',
      value: dcl[0]
    }
  } else {
    throw new Error('does not support this kind of criteria value decraration')
  }

}

function getComparing(comparing_part) {
  if (typeof comparing_part == 'function') {
    if (comparing_part.length != 2) {
      throw Error('comparing fn should accept 2 args')
    }
    return comparing_part
  }
  if (typeof comparing_part == 'string') {
    return {
      operator: comparing_part
    }
  } else if (Array.isArray(comparing_part)) {
    return {
      operator: comparing_part[0],
      convertor: comparing_part[1],
    }
  } else {
    throw new Error('does not support this kind of comparing decraration')
  }
}
