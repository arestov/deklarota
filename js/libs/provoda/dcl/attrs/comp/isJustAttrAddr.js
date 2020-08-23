var isJustAttrAddr = function(addr) {
  if (addr.result_type !== 'state') {
    return false
  }

  if (addr.nesting.path || (addr.resource && addr.resource.path) || addr.from_base.type) {
    return false
  }

  return true
}
export default isJustAttrAddr
