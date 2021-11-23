
const looksLikeWrappedJSON = function(string) {
  if (typeof string != 'string') {
    return false
  }

  return string.startsWith('"') && string.endsWith('"')
}

export default looksLikeWrappedJSON
