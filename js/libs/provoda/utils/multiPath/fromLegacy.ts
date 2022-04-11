
import memorize from '../../../spv/memorize'
import splitByDot from '../../../spv/splitByDot'
import getParsedState from '../getParsedState'
import type { LegacyAddress, LegacyAttAddress } from '../legacy-address.types'
import { emptyObject } from '../sameObjectIfEmpty'
import type { Addr, AttrAddr } from './addr.types'


const getPath = memorize(function(full_name: string): LegacyAddress {
  const result = getParsedState(full_name)
  if (result) {
    return result
  }

  const base_state_name = splitByDot(full_name)[0]
  if (base_state_name == null) {
    throw new Error()
  }
  const result2: LegacyAttAddress = {
    rel_type: 'local_state',
    full_name: full_name,
    state_name: base_state_name,
    full_state_name: full_name,
    base_state_name: base_state_name,
  }

  return result2
})

const createStateInfo = function(
  full_state_name: string | LegacyAttAddress, base_state_name?: string
): AttrAddr {
  if (!full_state_name) {
    return emptyObject
  }


  if (typeof full_state_name == 'object') {
    // getPath case

    if (full_state_name.base_state_name == null) {
      throw new Error()
    }

    return {
      base: full_state_name.base_state_name,
      path: full_state_name.full_name,
    }
  }

  const base = base_state_name || splitByDot(full_state_name)[0]
  if (base == null) {
    throw new Error()
  }

  return {
    base,
    path: full_state_name,
  }
}

const getFullPathInfo = memorize(function(full_path: string): Addr {
  const info = getPath(full_path)

  switch (info.rel_type) {
    case 'local_state': {
      return {
        result_type: 'state',
        zip_name: null,
        state: createStateInfo(info, info.base_state_name),
        nesting: emptyObject,
        from_base: emptyObject,
        resource: emptyObject,
        as_string: null,
      }
    }
    case 'nesting': {
      //  {
      //   rel_type: 'nesting',
      //   full_name: string,
      //   state_name: state_name,
      //
      //   nesting_source: nesting_source,
      //   nesting_name: nesting_source.selector.join('.'),
      //   zip_name: zip_func,
      //   zip_func: zip_func || itself,
      // };
      //
      const parts = info.nesting_source.selector

      if (info.state_name == null) {
        throw new Error()
      }

      const final_rel = parts[parts.length - 1]
      if (final_rel == null) {
        throw new Error()
      }
      return {
        result_type: info.state_name ? 'state' : 'nesting',
        zip_name: info.zip_name || null,
        state: createStateInfo(info.state_name),
        nesting: {
          path: parts,
          base: parts.slice(0, parts.length - 1),
          target_nest_name: final_rel,
        },
        from_base: emptyObject,
        resource: emptyObject,
        as_string: null,
      }
    }
    case 'parent': {
      //  {
      //   rel_type: 'parent',
      //   full_name: string,
      //   state_name: state_name,
      //
      //   ancestors: count,
      // };
      //
      return {
        result_type: 'state',
        state: createStateInfo(info.state_name, info.base_state_name),
        nesting: emptyObject,
        from_base: {
          type: 'parent',
          steps: info.ancestors,
        },
        zip_name: null,
        resource: emptyObject,
        as_string: null,
      }
    }

    case 'root': {
      //
      //  {
      //   rel_type: 'root',
      //   full_name: string,
      //   state_name: state_name
      // };
      return {
        result_type: 'state',
        state: createStateInfo(info.state_name, info.base_state_name),
        nesting: emptyObject,
        from_base: {
          type: 'root',
          steps: null,
        },
        resource: emptyObject,
        zip_name: null,
        as_string: null,
      }
    }
  }

  throw new Error()

})

export const clearCache = (): void => {
  getPath.__clear()
  getFullPathInfo.__clear()
}

export default getFullPathInfo
