

function arrayToDcls(list) {
  var result = {}
  for (var i = 0; i < list.length; i++) {
    var name = list[i]
    if (typeof name != 'string') {
      throw new Error('attr name should be string')
    }
    result[name] = ['input', undefined]
  }
  return result
}

function objToDcls(obj) {
  var result = {}
  for (var name in obj) {
    if (!obj.hasOwnProperty(name)) {
      continue
    }
    result[name] = ['input', obj[name]]
  }
  return result
}


export default function inputAttrs(params) {
  if (!params) {
    throw new Error('params should not be empty')
  }

  if (Array.isArray(params)) {
    return arrayToDcls(params)
  }

  if (params !== Object(params)) {
    throw new Error('unsupported params')
  }

  return objToDcls(params)
};
