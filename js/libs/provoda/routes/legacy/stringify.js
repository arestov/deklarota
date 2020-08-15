define(function(require) {
'use strict'

var getValue = function(app, value) {
  if (value) {
    return app.encodeURLPart(value)
  }

  if (value === 0) {
    return app.encodeURLPart(value)
  }
}

var pathExecutor = function(getChunk) {
  return function getPath(obj, app, arg1, arg2) {
    if (obj.parsed.states) {
      var full_path = ''
      for (var i = 0; i < obj.parsed.clean_string_parts.length; i++) {
        full_path += obj.parsed.clean_string_parts[i]
        var cur_state = obj.parsed.states[i]
        if (cur_state) {
          var chunk = getChunk(cur_state, app, arg1, arg2)
          full_path += getValue(app, chunk) || 'null'
        }
      }
      return full_path
    }
    return obj.full_usable_string
  }
}

return pathExecutor

})
