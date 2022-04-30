
const isBoolCompAttr = (params: 'bool' | {type: 'bool'} | undefined): boolean => {
  if (params == null) {
    return false
  }

  if (params == 'bool') {
    return true
  }

  if (params.type == 'bool') {
    return true
  }

  return false
}

export default isBoolCompAttr
