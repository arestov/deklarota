import type { Addr, AscendorAddr, AttrAddr, RelAddr, RouteAddr, ZipAddr } from './addr.types'

type ZipArg = ZipAddr | boolean


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

function isStateOk(state: AttrAddr): boolean {
  return Boolean(state && state.path)
}

function wrapBySpace(item: string): string {
  if (!item) {
    return ''
  }

  return ' ' + item + ' '
}

function firstPart(zip_name: ZipArg, state: AttrAddr): string {
  return '<' + wrapBySpace(zipPart(zip_name) + stateString(state))
}

function zipPart(zip_name: ZipArg): string {
  if (!zip_name) {
    return ''
  }

  return '@' + zip_name + ':'
}


function stateString(state: AttrAddr): string {
  if (!isStateOk(state)) {
    return ''
  }

  return state.path
}

function isNestingOk(nesting: RelAddr): boolean {
  return Boolean(nesting && nesting.path)
}

function nestingString(zip_name: ZipArg, nesting: RelAddr): string {
  if (!isNestingOk(nesting)) {
    return '<'
  }

  const path = nesting.path.join('.')

  return '<' + wrapBySpace(zipPart(zip_name) + path)
}

function resourceString(resource: RouteAddr): string {
  if (!resource || !resource.path) {
    return '<'
  }

  return '< ' + resource.path + ' '
}

function baseStringMin(from_base: AscendorAddr): string {
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

function baseString(from_base: AscendorAddr): string {
  const result = baseStringMin(from_base)
  return result ? '< ' + result : '<'
}

export { baseStringMin }
