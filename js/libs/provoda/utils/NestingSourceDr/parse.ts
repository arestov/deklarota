
import memorize from '../../../spv/memorize'
import splitByDot from '../../../spv/splitByDot'
import type { NestingSource } from '../legacy-address.types'
import type { RelPath } from '../multiPath/addr.types'

class NestingSourceDr {
  start_point: string | false
  selector: RelPath
  constructor(string: string) {
    const parts = string.split('>')
    this.start_point = parts.length > 1 && (parts[0] || false)
    const last_part = parts[parts.length - 1]
    if (last_part == null) {
      throw new Error('provide last part of path')
    }
    this.selector = splitByDot(last_part)
  }
}

export default memorize(function parseNSD(string) {
  return new NestingSourceDr(string) as NestingSource
})
