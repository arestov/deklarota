import type { Addr } from './addr.types'
import multiPathAsString from './asString'
import isJustAttrAddr from './isJustAttrAddr'

const shortStringWhenPossible = function(addr: Addr): string {

  if (!isJustAttrAddr(addr)) {
    return multiPathAsString(addr)
  }

  return addr.state.path
}

export default shortStringWhenPossible
