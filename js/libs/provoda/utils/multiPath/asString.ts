import type { EmptyObject } from '../empty.types'
import type { ParentAscendor, RootAscendor } from './addr-parts/ascendor.types'
import type { AttrPartOfAddr } from './addr-parts/attr.types'
import type { RelPartOfAddr } from './addr-parts/rel.types'
import type { RoutePartOfAddr } from './addr-parts/routes.types'

type Ascendor = RootAscendor | ParentAscendor | EmptyObject
type Route = RoutePartOfAddr | EmptyObject
type Rel = RelPartOfAddr | EmptyObject
type Zip = null | string

type Addr = {
  zip_name: Zip
  as_string: null | string
  state: AttrPartOfAddr
  nesting: Rel
  resource: Route
  from_base: Ascendor
}

type ZipArg = Zip | boolean


export default function multiPathAsString(multi_path: Addr): string {
  if (multi_path.as_string) {
    return multi_path.as_string
  }

  multi_path.as_string = ''
    + firstPart(isStateOk(multi_path.state) && multi_path.zip_name, multi_path.state)
    + nestingString(!isStateOk(multi_path.state) && multi_path.zip_name, multi_path.nesting)
    + resourceString(multi_path.resource)
    + baseString(multi_path.from_base)

  return multi_path.as_string
};

function isStateOk(state: AttrPartOfAddr): boolean {
  return Boolean(state && state.path)
}

function wrapBySpace(item: string): string {
  if (!item) {
    return ''
  }

  return ' ' + item + ' '
}

function firstPart(zip_name: ZipArg, state: AttrPartOfAddr): string {
  return '<' + wrapBySpace(zipPart(zip_name) + stateString(state))
}

function zipPart(zip_name: ZipArg): string {
  if (!zip_name) {
    return ''
  }

  return '@' + zip_name + ':'
}


function stateString(state: AttrPartOfAddr): string {
  if (!isStateOk(state)) {
    return ''
  }

  return state.path
}

function isNestingOk(nesting: Rel): boolean {
  return Boolean(nesting && nesting.path)
}

function nestingString(zip_name: ZipArg, nesting: Rel): string {
  if (!isNestingOk(nesting)) {
    return '<'
  }

  const path = nesting.path.join('.')

  return '<' + wrapBySpace(zipPart(zip_name) + path)
}

function resourceString(resource: Route): string {
  if (!resource || !resource.path) {
    return '<'
  }

  return '< ' + resource.path + ' '
}

function baseStringMin(from_base: Ascendor): string {
  if (!from_base || !from_base.type) {
    return ''
  }

  switch (from_base.type) {
    case 'root': {
      return '#'
    }
    case 'parent': {
      let repeated = ''
      let counter = 1
      while (counter <= from_base.steps) {
        repeated += '^'
        counter++
      }
      return repeated
    }

  }
}

function baseString(from_base: Ascendor): string {
  const result = baseStringMin(from_base)
  return result ? '< ' + result : '<'
}

export { baseStringMin }
