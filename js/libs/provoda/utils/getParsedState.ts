
import parse from './NestingSourceDr/parse'
import asString from './multiPath/asString'
import splitByDot from '../../spv/splitByDot'
import memorize from '../../spv/memorize'
import type { Addr } from './multiPath/addr.types'
import type { ParentAscendor } from './multiPath/addr-parts/ascendor.types'

function itself<SomeType>(item: SomeType): SomeType {return item}

const selfRef = {rel_type: 'self'} as const
type LegacyParentAddress = {
  rel_type: 'parent'
  full_name: string
  state_name: string
  full_state_name: string
  base_state_name: string
  ancestors: number
  nil_allowed?: boolean
}

type LegacyNestingAddress ={
  rel_type: 'nesting'
  full_name: string
  state_name: string | undefined
  full_state_name: string | undefined
  base_state_name: string | undefined

  nesting_source: ReturnType<typeof parse>
  nesting_name: string
  zip_name: string | undefined
  zip_func: string | typeof itself
  nil_allowed?: boolean
}

type LegacyRootAddress = {
  rel_type: 'root',
  full_name: string
  state_name: string
  full_state_name: string
  base_state_name: string
  nil_allowed?: boolean
}

type LegacyAddress = LegacyParentAddress | LegacyNestingAddress | LegacyRootAddress

const enc_states = {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  '^': (function() { // parent
    const parent_count_regexp = /^\^+/gi
      // example: '^visible'
    return function parent(string: string, nil_allowed?: boolean): LegacyParentAddress {

      const state_name = string.replace(parent_count_regexp, '')
      const count = string.length - state_name.length
      const base_state_name = state_name && splitByDot(state_name)[0]
      if (base_state_name == null) {
        throw new Error('')
      }

      return {
        rel_type: 'parent',
        full_name: string,
        state_name: state_name,
        full_state_name: state_name,
        base_state_name: base_state_name,
        ancestors: count,
        nil_allowed: nil_allowed !== false
      }
    }
  })(),
  '@': function nesting(string: string, nil_allowed?: boolean): LegacyNestingAddress {
    // nesting

    //example:  '@some:complete:list'
    const nesting_and_state_name = string.slice(1)
    const parts = nesting_and_state_name.split(':')

    const nesting_name = parts.pop()
    const state_name = parts.pop()
    const zip_func = parts.pop()

    const nesting_source = parse(nesting_name)

    return {
      rel_type: 'nesting',
      full_name: string,
      state_name: state_name,
      full_state_name: state_name,
      base_state_name: state_name && splitByDot(state_name)[0],


      nesting_source: nesting_source,
      nesting_name: nesting_source.selector.join('.'),
      zip_name: zip_func,
      zip_func: zip_func || itself,
      nil_allowed: nil_allowed !== false

    }
  },
  '#': function(string: string, nil_allowed?: boolean): LegacyRootAddress {
    // root

    //example: '#vk_id'
    const state_name = string.slice(1)
    if (!state_name) {
      throw new Error('should be state_name')
    }

    const base_state_name = state_name && splitByDot(state_name)[0]
    if (base_state_name == null) {
      throw new Error('')
    }

    return {
      rel_type: 'root',
      full_name: string,
      state_name: state_name,
      full_state_name: state_name,
      base_state_name,
      nil_allowed: nil_allowed !== false

    }
  }
} as const

const simulateLegacyPath = {
  '^': function(multi_path: Addr & {from_base: ParentAscendor}): LegacyParentAddress {
    return {
      rel_type: 'parent',
      full_name: asString(multi_path),
      state_name: multi_path.state.path,
      full_state_name: multi_path.state.path,
      base_state_name: multi_path.state.base,

      ancestors: multi_path.from_base.steps,
    }
  },
  '@': function(multi_path: Addr): LegacyNestingAddress {
    return {
      rel_type: 'nesting',
      full_name: asString(multi_path),
      state_name: multi_path.state.path,
      full_state_name: multi_path.state.path,
      base_state_name: multi_path.state.base,


      nesting_source: {
        start_point: false,
        selector: multi_path.nesting.path,
      },
      nesting_name: multi_path.nesting.path.join('.'),
      zip_name: multi_path.zip_name || undefined,
      zip_func: multi_path.zip_name || itself,
    }
  },
  '#': function(multi_path: Addr): LegacyRootAddress {

    return {
      rel_type: 'root',
      full_name: asString(multi_path),
      state_name: multi_path.state.path,
      full_state_name: multi_path.state.path,
      base_state_name: multi_path.state.base,
    }
  }
} as const

export const fromMultiPath = function(multi_path: Addr, _as_string: string, original: string): null | typeof selfRef | LegacyAddress {

  if (multi_path.base_itself) {
    return selfRef
  }

  if (multi_path.resource.path) {
    throw new Error('dont use route: for attr.comp (runtime not implemented)')
  }

  if (multi_path.from_base.type && multi_path.nesting.path) {
    throw new Error('dont use asc: and rel: for attr.comp (runtime not implemented)')
  }

  if (multi_path.nesting.path && !multi_path.zip_name) {
    console.warn('zip name `@one:` or `@all:` should be provided for ' + original)
  }

  if (multi_path.from_base.type === 'parent') {
    return simulateLegacyPath['^'](multi_path as Addr & {from_base: ParentAscendor})
  }

  if (multi_path.from_base.type == 'root') {
    return simulateLegacyPath['#'](multi_path)
  }

  if (multi_path.nesting.path) {
    return simulateLegacyPath['@'](multi_path)
  }

  return null
}

const getParsedState = memorize(function getParsedState(state_name: string) {
  // isSpecialState
  const required = state_name.charAt(0) === '&'
  const rest = required ? state_name.slice(1) : state_name
  const start = rest.charAt(0)
  switch (start) {
    case '^':
    case '@':
    case '#':
      return enc_states[start](rest, required)
  }

  return null
})

export const clearCache = (): void => {
  getParsedState.__clear()
}

export default getParsedState
