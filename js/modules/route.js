


export default {
  encodeURLPart: encodeURLPart,
  decodeURLPart: decodeURLPart,
  joinCommaParts: joinCommaParts,
  getCommaParts: getCommaParts
}

function encodeURLPart(part) {
  if (typeof part == 'number') {
    return encodeURIComponent(part)
  }

  const spaced = part.split(' ')
  for (let i = 0; i < spaced.length; i++) {
    spaced[i] = encodeURIComponent(spaced[i])
  }
  return spaced.join('+')
}

function decodeURLPart(part) {
  const spaced = part.split('+')
  for (let i = 0; i < spaced.length; i++) {
    spaced[i] = decodeURIComponent(spaced[i])
  }
  return spaced.join(' ')
}

function joinCommaParts(array) {
  return array.map(function(item) {
    return encodeURLPart(item)
  }).join(',')
}

function getCommaParts(string) {
  const parts = string.split(',')
  for (let i = 0; i < parts.length; i++) {
    parts[i] = decodeURLPart(parts[i])
  }
  return parts
}
