

const getValue = function(app, value) {
  if (value) {
    return app.encodeURLPart(value)
  }

  if (value === 0) {
    return app.encodeURLPart(value)
  }
}

const pathExecutor = function(getChunk) {
  return function getPath(obj, app, arg1, arg2) {
    if (obj.parsed.states) {
      let full_path = ''
      for (let i = 0; i < obj.parsed.clean_string_parts.length; i++) {
        full_path += obj.parsed.clean_string_parts[i]
        const st_dcl = obj.parsed.states_map[i]
        if (st_dcl) {
          const source = st_dcl[1]
          const value = st_dcl[2]

          const chunk = value ?? getChunk(source, app, arg1, arg2)
          full_path += getValue(app, chunk) || 'null'
        }
      }
      return full_path
    }
    return obj.full_usable_string
  }
}

export default pathExecutor
