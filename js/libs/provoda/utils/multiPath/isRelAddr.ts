import type { Addr } from './addr.types'

const isRelAddr = function(addr: Addr): boolean {
  return Boolean(addr.nesting && addr.nesting.path && addr.nesting.path.length)
}

export default isRelAddr
