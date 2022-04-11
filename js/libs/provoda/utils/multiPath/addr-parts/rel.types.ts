import type { RelPath } from '../addr.types'

export type RelPartOfAddr = {
  path: RelPath,
  base: RelPath
  target_nest_name: string
}
