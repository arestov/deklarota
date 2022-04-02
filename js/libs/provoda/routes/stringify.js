
import looksLikeWrappedJSON from './utils/looksLikeWrappedJSON'

const statePartAsString = function(state_dcl, data) {
  if (!state_dcl) {
    return ''
  }

  const source = state_dcl[1]
  const value = state_dcl[2] || data[source]
  if (value == null) {
    return ''
  }

  if (typeof value == 'string') {
    if (looksLikeWrappedJSON(value)) {
      return encodeURIComponent(JSON.stringify(data[source]))
    }

    return encodeURIComponent(value)
  }

  return encodeURIComponent('"' + JSON.stringify(data[source]) + '"')
}


const toString = function(parsed, data) {
  // 'tracks/[:artist:next_value],[:track]' +  {next_value: 'Mike', track: 'Play With You'}
  // => 'tracks/Mike,Play%20With%20You'

  const parts = parsed.parts
  const toStrings = new Array(parts.length)
  for (let i = 0; i < parts.length; i++) {
    const cur = parts[i]
    const result = (cur.prefix || '') + statePartAsString(cur.state, data)
    toStrings[i] = result
  }
  return toStrings.join('')
}

export default toString
