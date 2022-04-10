

import getParsedPath from '../../routes/legacy/getParsedPath'
import supportedZip from './supportedZip'
import fromLegacy from './fromLegacy'
import isJustAttrAddr from './isJustAttrAddr'
import memorize from '../../../spv/memorize'
import { doCopy } from '../../../spv/cloneObj'
import splitByDot from '../../../spv/splitByDot'
import parseAttrPart from './addr-parts/attr'
import { parents, parseAscendorPart } from './addr-parts/ascendor'

export { parseAscendorPart as getBaseInfo }

const empty = Object.freeze({})

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

const parseFromStart = memorize(function(string) {
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

function canParseModern(string) {
  const from_start = start.test(string)
  const from_end = end.test(string)
  return (from_start || from_end)
    ? {from_start: from_start, from_end: from_end}
    : null
}

const parseModern = memorize(function parseModern(string) {
  const can_parse = canParseModern(string)
  if (can_parse == null) {
    return null
  }

  if (can_parse.from_start) {
    return parseFromStart(string)
  }
  return parseFromEnd(string)
})

const matchNotStateSymbols = /(^\W)|\@|\:/


export const getStateInfo = memorize(parseAttrPart)

const SimpleStateAddr = function(string) {
  this.state = getStateInfo(string)
}

SimpleStateAddr.prototype = doCopy(SimpleStateAddr.prototype, {
  result_type: 'state',
  zip_name: null,
  state: null,
  nesting: empty,
  resource: empty,
  from_base: empty,
  as_string: null,
})

const simpleState = memorize(function simpleState(string) {
  return new SimpleStateAddr(string)
})

const attemptSimpleStateName = function(string) {
  if (!string || matchNotStateSymbols.test(string)) {
    return null
  }

  return simpleState(string)
}

const self = Object.freeze({
  as_string: '<<<<',
  base_itself: true,
})


export const getNestInfo = memorize(function getNestInfo(string) {
  if (!string) {
    return empty
  }

  const parts = string.split(':')
  const path = parts.pop()

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
})

const parseMultiPath = function(string, allow_legacy) {
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


const parseWithCache = function(addr_str, legacy_ok) {
  if (legacy_ok != true) {
    return parseModernCached(addr_str, false)
  }

  return parseLegacyCached(addr_str, true)
}


parseWithCache.simpleState = simpleState

export default parseWithCache

function parseParts(state_raw, nest_raw, resource_raw, base_raw) {
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


  const zip_name = zip_state_string || zip_nest_string || null
  const state_info = getStateInfo(state_string)
  const nest_info = getNestInfo(nest_string)
  const resource_info = getResourceInfo(resource_raw)
  const base_info = parseAscendorPart(base_raw)

  const result_type = getResultType(state_info, nest_info, resource_info, base_info)

  return Object.seal({
    result_type: result_type,
    zip_name: zip_name,
    state: state_info,
    nesting: nest_info,
    resource: resource_info,
    from_base: base_info,
    as_string: null,
  })
}


export function updateResultType(draft) {
  draft.result_type = getResultType(draft.state, draft.nesting, draft.resource, draft.from_base)

}

export function createAddrByPart(source) {
  const draft = Object.seal({
    result_type: null,
    zip_name: null,
    state: source.state || empty ,
    nesting: source.nesting || empty,
    resource: source.resource || empty,
    from_base: source.from_base || empty,
    as_string: null,
  })

  updateResultType(draft)
  return draft
}


export function getResourceInfo(string) {
  if (!string) {
    return empty
  }

  if (string.startsWith('#')) {
    throw new Error('use "ascending part" for root/parent traversing')
  }

  if (string.startsWith('/')) {
    const err = new Error('route should no starts with `/`')
    console.log(string, err)
    throw err
  }

  return {
    path: string,
    template: getParsedPath(string),
  }
}

function getResultType(state, nest) {
  if (state && state.path) {
    return 'state'
  }

  if (nest && nest.path) {
    return 'nesting'
  }

  return null
}

export const clearCache = () => {
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
