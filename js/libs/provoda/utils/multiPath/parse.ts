

import supportedZip from './supportedZip'
import fromLegacy from './fromLegacy'
import isJustAttrAddr from './isJustAttrAddr'
import memorize from '../../../spv/memorize'
import parseAttrPart from './addr-parts/attr'
import { parents, parseAscendorPart } from './addr-parts/ascendor'
import parseRelPart from './addr-parts/rel'
import parseRoutePart from './addr-parts/route'
import { emptyObject } from '../sameObjectIfEmpty'
import type { Addr, AddrResultKind, AddrSelf, AscendorAddr, AttrAddr, RelAddr, RouteAddr } from './addr.types'

export { parseAscendorPart as getBaseInfo }
export { parseRoutePart as getResourceInfo }

type AddrDraft = Partial<Addr>

const empty = emptyObject

/*


/(\^|\s+)(\<)(\s+)/
"< @all state_name < nesting < resource < #"

"< state_name < aggr:nesting < resource < #"

"< state_name << /resource/[:ddaf]/sdf < #"

"< state_name <<< #"
"<< nesting_name << #"

"<< nesting_name << ^^"
"< state_name <<< ^^"

"< state_name"
"state_name"

"/resource/[:ddaf]/sdf < #"
"/resource/[:ddaf]/sdf <"

"nesting_name < < ^^"
*/
const checkSplit = /(?:^|\s+)?<(?:\s+)?/
const end = /(<$)|(\^$)|(#$)/
const start = /^</

const parseFromStart = memorize(function(string: string) {
  const parts = string.split(checkSplit)
  // parts[0] should be empty
  const state = parts[1]
  const nest = parts[2]
  const resource = parts[3]
  const base = parts[4]

  return parseParts(state, nest, resource, base)

})

const parseFromEnd = memorize(function(string) {
  const parts = string.split(checkSplit)

  const length = parts.length
  const base = parts[length - 1]
  const resource = parts[length - 2]
  const nest = parts[length - 3]
  const state = parts[length - 4]

  return parseParts(state, nest, resource, base)
})

const parseModern = memorize(function parseModern(string: string): Addr | null {
  if (start.test(string)) {
    return parseFromStart(string)
  }
  if (end.test(string)) {
    return parseFromEnd(string)
  }

  return null
})

const matchNotStateSymbols = /(^\W)|\@|\:/


export const getStateInfo = memorize(parseAttrPart)

type SimpleAttrAddr = {
  // eslint-disable-next-line no-unused-vars
  new (string: string): Addr
}

// eslint-disable-next-line no-unused-vars
const SimpleStateAddr = function(this: Addr, string: string): void {
  this.state = getStateInfo(string)
} as unknown as SimpleAttrAddr

Object.assign(SimpleStateAddr.prototype, {
  result_type: 'state',
  zip_name: null,
  state: null,
  nesting: empty,
  resource: empty,
  from_base: empty,
  as_string: null,
})

const simpleState = memorize(function simpleState(string: string): Addr {
  const result = new SimpleStateAddr(string)
  return result
})

const attemptSimpleStateName = function(string: string): null | Addr {
  if (!string || matchNotStateSymbols.test(string)) {
    return null
  }

  return simpleState(string)
}

const self: AddrSelf = Object.freeze({
  as_string: '<<<<',
  base_itself: true,
})


export const getNestInfo = memorize(parseRelPart)

const parseMultiPath = function(string: string, allow_legacy?: boolean): Addr | AddrSelf | null {
  if (string == '<<<<') {
    return self
  }


  const modern = parseModern(string)
  if (modern != null) {
    const state_info = modern.state
    if (state_info && state_info.base && !isJustAttrAddr(modern) && state_info.base.startsWith('__')) {
      console.warn(new Error('private attr used'), string)
    }

    return modern
  }

  return attemptSimpleStateName(string) || (
    allow_legacy ? fromLegacy(string) : null
  )

}
const matchZip = /(?:\@(.+?)\:)?(.+)?/

const parseLegacyCached = memorize(parseMultiPath)
const parseModernCached = memorize(parseMultiPath)


const parseWithCache = function(addr_str: string, legacy_ok?: boolean): Addr | AddrSelf | null {
  if (legacy_ok != true) {
    return parseModernCached(addr_str, false)
  }

  return parseLegacyCached(addr_str, true)
}


parseWithCache.simpleState = simpleState

export default parseWithCache

function migrateRelString(rel_string: string | undefined | null, base: AscendorAddr, resource: RouteAddr): string | undefined | null {
  if (!base.type) {
    return rel_string
  }

  if (resource.path) {
    return rel_string
  }

  const path_end = rel_string ? `.${rel_string}` : ''

  switch (base.type) {
    case 'root':
      return `$root${path_end}`
    case 'parent': {
      const full_prefix_path: string[] = []
      for (let i = 0; i < base.steps; i++) {
        full_prefix_path.push('$parent')
      }
      return `${full_prefix_path.join('.')}${path_end}`
    }
  }
}

function parseParts(state_raw?: string, nest_raw?: string, resource_raw?: string, base_raw?: string): Addr {
  const state_part_splited = state_raw && state_raw.match(matchZip)
  const zip_state_string = state_part_splited && state_part_splited[1]
  const state_string = state_part_splited && state_part_splited[2]

  const nest_part_splited = nest_raw && nest_raw.match(matchZip)
  const zip_nest_string = nest_part_splited && nest_part_splited[1]
  const nest_string = nest_part_splited && nest_part_splited[2]

  if (zip_state_string && zip_nest_string) {
    throw new Error('both state and nesting cant have zip_name')
  }

  if (zip_nest_string && state_string) {
    throw new Error('use state zip')
  }

  if (zip_state_string && !state_string && nest_string) {
    throw new Error('use nest zip')
  }

  if (zip_state_string && !supportedZip(zip_state_string, 'state')) {
    throw new Error('unsupported zip for state: ' + zip_state_string)
  }

  if (zip_nest_string && !supportedZip(zip_nest_string, 'nesting')) {
    throw new Error('unsupported zip for state: ' + zip_nest_string)
  }
  const base_info = parseAscendorPart(base_raw || null)
  const resource_info = parseRoutePart(resource_raw || null)

  const migrated_rel_string = migrateRelString(nest_string, base_info, resource_info)

  const zip_name = zip_state_string || zip_nest_string || null || (migrated_rel_string != nest_string ? 'one' : null)
  const state_info = getStateInfo(state_string || null)
  const nest_info = getNestInfo(migrated_rel_string || null)

  const result_type = getResultType(state_info, nest_info)

  return Object.seal({
    result_type: result_type,
    zip_name: zip_name,
    state: state_info,
    nesting: nest_info,
    resource: resource_info,
    from_base: resource_info.path ? base_info : emptyObject,
    as_string: null,
  })
}


export function updateResultType(draft: Addr): void {
  draft.result_type = getResultType(draft.state, draft.nesting)

}

export function createAddrByPart(source: AddrDraft): Addr {
  const draft = Object.seal({
    result_type: null,
    zip_name: source.zip_name || null,
    state: source.state || empty ,
    nesting: source.nesting || empty,
    resource: source.resource || empty,
    from_base: source.from_base || empty,
    as_string: null,
  })

  updateResultType(draft)
  return draft
}

function getResultType(state: AttrAddr, nest: RelAddr): AddrResultKind {
  if (state && state.path) {
    return 'state'
  }

  if (nest && nest.path) {
    return 'nesting'
  }

  return null
}

export const clearCache = (): void => {
  parents.__clear()
  parseFromStart.__clear()
  parseFromEnd.__clear()
  parseModern.__clear()
  getStateInfo.__clear()
  simpleState.__clear()
  getNestInfo.__clear()
  parseLegacyCached.__clear()
  parseModernCached.__clear()
}
