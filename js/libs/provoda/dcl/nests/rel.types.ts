import type { Addr } from '../../utils/multiPath/addr.types'

export type RelLink = {
  type: 'addr',
  value: Addr,
} | {
  type: 'constr'
  value: string
}
