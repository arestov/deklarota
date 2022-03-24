function isProvodaBhv(md) {
  return md.hasOwnProperty('_provoda_id') || md.hasOwnProperty('view_id')
}

export function isOk(list) {
  if (!list) {
    return true
  }

  if (!Array.isArray(list)) {
    return isProvodaBhv(list)
  }


  if (!list.length) {
    return true
  }

  return list.every(isProvodaBhv)

}
