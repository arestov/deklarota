define(function() {
'use strict'

var nestConstructor = function(name, item, raw_key) {
  if (typeof item == 'string') {
    return {
      name: name,
      type: 'route',
      value: item
    }
  } else {
    if (!raw_key) {
      throw new Error('key should be provided')
    }
    var key = raw_key

    return {
      name: name,
      type: 'constr',
      value: item,
      key: key,
    }
  }
}

var declarationConstructor = function(name, cur, key_prefix) {
  if (Array.isArray(cur)) {
    var result = []
    for (var i = 0; i < cur.length; i++) {
      result[i] = nestConstructor(name, cur[i], key_prefix + name + '-' + i)
    }
    return result
  } else {
    return nestConstructor(name, cur, key_prefix + name)
  }
}

return {
  nestConstructor: nestConstructor,
  declarationConstructor: declarationConstructor
}
})
