
import looksLikeWrappedJSON from './utils/looksLikeWrappedJSON'

var statePartAsString = function(state_dcl, data) {
  if (!state_dcl) {
    return ''
  }

  var source = state_dcl[1]
  var value = data[source]
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


var toString = function(parsed, data) {
  // 'tracks/[:artist:next_value],[:track]' +  {next_value: 'Mike', track: 'Play With You'}
  // => 'tracks/Mike,Play%20With%20You'

  var parts = parsed.parts
  var toStrings = new Array(parts.length)
  for (var i = 0; i < parts.length; i++) {
    var cur = parts[i]
    var result = (cur.prefix || '') + statePartAsString(cur.state, data)
    toStrings[i] = result
  }
  return toStrings.join('')
}

export default toString
