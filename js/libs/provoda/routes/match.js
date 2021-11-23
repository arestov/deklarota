

import looksLikeWrappedJSON from './utils/looksLikeWrappedJSON'

const tryParse = function(text) {
  try {
    const to_parse = text.slice(1, -1)
    return JSON.parse(to_parse)
  } catch (e) {
    return text
  }
}


const match = function(parsed, some_url) {
  // 'tracks/[:artist:next_value],[:track]' + 'tracks/Mike,Play%20With%20You'
  // => next_value: Mike, track: 'Play With You'
  if (!some_url) {
    return null
  }

  const matched = parsed.matcher.exec(some_url)
  if (!matched) {
    return null
  }

  const result = {}

  for (let i = 0; i < parsed.parts.length; i++) {
    const cur = parsed.parts[i]
    if (!cur.state) {
      continue
    }
    const raw_value = matched[cur.matching_group]
    const decoded = decodeURIComponent(raw_value)

    const unparsed = looksLikeWrappedJSON(decoded)
      ? tryParse(decoded)
      : decoded

    const source = cur.state[0]

    result[source] = unparsed
  }

  return result
}

export default match
