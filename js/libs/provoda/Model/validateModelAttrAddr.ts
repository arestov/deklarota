import type { Addr } from '../utils/multiPath/addr.types'

const validateModelAttrAddr = (addr: Addr, code_path: string): void => {
  if (addr.legacy_ascendor_migrate_needed) {
    console.warn('use $parent or $root rel for comp attrs', `"${addr.legacy_ascendor_migrate_needed}"`, code_path)
    throw new Error('use $parent or $root rel for comp attrs')
  }
}

export default validateModelAttrAddr
