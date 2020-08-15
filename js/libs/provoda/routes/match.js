define(function(require) {
'use strict'

var looksLikeWrappedJSON = require('./utils/looksLikeWrappedJSON')

var tryParse = function(text) {
  try {
    var to_parse = text.slice(1, -1)
    return JSON.parse(to_parse)
  } catch (e) {
    return text
  }
}


var match = function(parsed, some_url) {
  // 'tracks/[:artist:next_value],[:track]' + 'tracks/Mike,Play%20With%20You'
  // => next_value: Mike, track: 'Play With You'
  if (!some_url) {
    return null
  }

  var matched = parsed.matcher.exec(some_url)
  if (!matched) {
    return null
  }

  var result = {}

  for (var i = 0; i < parsed.parts.length; i++) {
    var cur = parsed.parts[i]
    if (!cur.state) {
      continue
    }
    var raw_value = matched[cur.matching_group]
    var decoded = decodeURIComponent(raw_value)

    var unparsed = looksLikeWrappedJSON(decoded)
      ? tryParse(decoded)
      : decoded

    var source = cur.state[0]

    result[source] = unparsed
  }

  return result
}

return match
})
