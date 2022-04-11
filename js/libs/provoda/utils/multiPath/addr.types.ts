import type { EmptyObject } from '../empty.types'
import type { ParentAscendor, RootAscendor } from './addr-parts/ascendor.types'
import type { AttrPartOfAddr } from './addr-parts/attr.types'
import type { RelPartOfAddr } from './addr-parts/rel.types'
import type { RoutePartOfAddr } from './addr-parts/routes.types'

export type RelPath = string[]

export type AscendorAddr = RootAscendor | ParentAscendor | EmptyObject
export type RouteAddr = RoutePartOfAddr | EmptyObject
export type RelAddr = RelPartOfAddr | EmptyObject
export type ZipAddr = null | string
export type AttrAddr = AttrPartOfAddr | EmptyObject

export type Addr = {
  zip_name: ZipAddr
  as_string: null | string
  state: AttrAddr
  nesting: RelAddr
  resource: RouteAddr
  from_base: AscendorAddr
  base_itself?: boolean
}
