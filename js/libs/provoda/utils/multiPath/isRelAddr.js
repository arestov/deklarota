const isRelAddr = function(addr) {
  return Boolean(addr.nesting && addr.nesting.path && addr.nesting.path.length)
}

export default isRelAddr
