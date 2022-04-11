import splitByDot from '../../../../spv/splitByDot'
import type { EmptyObject } from '../../empty.types'
import type { RelPartOfAddr } from './rel.types'
import { emptyObject } from '../../sameObjectIfEmpty'

function parseRelPart(string: string | null): EmptyObject | RelPartOfAddr {
  if (!string) {
    return emptyObject
  }

  const parts = string.split(':')
  const path = parts.pop()

  if (path == null) {
    throw new Error('path can\`t be empty')
  }

  const full_path = splitByDot(path)

  const zip_name = parts[0] || null

  if (zip_name) {
    throw new Error('dont use. use < @[zip_name] [statename] < [nestingname]')
  }

  const target_nest_name = full_path[full_path.length - 1] // last one

  if (!target_nest_name) {
    throw new Error('wrong nest path: ' + string)
  }

  return {
    path: full_path,
    base: full_path.slice(0, full_path.length - 1), // all, except last
    target_nest_name: target_nest_name,
  }
}

export default parseRelPart
