import type { RelPath } from './multiPath/addr.types'

export type NestingSource = {
  start_point: string | false
  selector: RelPath
}

export type LegacySelfRef = {rel_type: 'self'}

// eslint-disable-next-line no-unused-vars
type Identify = <SomeType>(item: SomeType) => SomeType

export type LegacyParentAddress = {
  rel_type: 'parent'
  full_name: string
  state_name: string
  full_state_name: string
  base_state_name: string
  ancestors: number
  nil_allowed?: boolean
}

export type LegacyNestingAddress ={
  rel_type: 'nesting'
  full_name: string
  state_name: string | undefined
  full_state_name: string | undefined
  base_state_name: string | undefined

  nesting_source: NestingSource
  nesting_name: string
  zip_name: string | undefined
  zip_func: string | Identify
  nil_allowed?: boolean
}

export type LegacyRootAddress = {
  rel_type: 'root',
  full_name: string
  state_name: string
  full_state_name: string
  base_state_name: string
  nil_allowed?: boolean
}

export type LegacyAddress = LegacyParentAddress | LegacyNestingAddress | LegacyRootAddress | LegacySelfRef
