import type { Addr } from './addr.types'

const isExternalAttrAddr = function(addr: Addr): boolean {
  if (addr.result_type !== 'state') {
    return false
  }

  if (addr.nesting.path || (addr.resource && addr.resource.path) || addr.from_base.type) {
    return true
  }

  return false
}
export default isExternalAttrAddr
