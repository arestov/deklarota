
import getParsedPath from '../../routes/legacy/getParsedPath'
import type { LegacyRichRoute } from '../../routes/legacy/legacy-routes.types'
import type { EmptyObject } from '../empty.types'
import { emptyObject } from '../sameObjectIfEmpty'
import type { Addr, AscendorAddr, RouteAddr } from './addr.types'

// var NestingSourceDr = require('../../utils/NestingSourceDr');

// var parts = string.split('>');
// console.log('NestingSourceDr()', parts)
// this.start_point = parts.length > 1 && parts[0];
// this.selector = splitByDot(parts[parts.length - 1]);
const toPath = function(string: string): EmptyObject | {path: string, template: LegacyRichRoute} {
  if (!string) {
    return emptyObject
  }

  return {
    path: string,
    template: getParsedPath(string),
  }
}

const parseStartPoint = function(start_point: string): {resource: RouteAddr, from_base: AscendorAddr} {
  if (!start_point) {
    return {
      resource: emptyObject,
      from_base: emptyObject,
    }
  }

  const parsed_path = getParsedPath(start_point)

  // debugger

  if (parsed_path.from_root) {
    return {
      resource: toPath(parsed_path.full_usable_string),
      from_base: {
        type: 'root',
        steps: null,
      }
    }
  }

  if (parsed_path.from_parent) {
    return {
      resource: toPath(parsed_path.full_usable_string),
      from_base: {
        type: 'parent',
        steps: parsed_path.from_parent,
      }
    }
  }

  return {
    resource: toPath(parsed_path.full_usable_string),
    from_base: emptyObject,
  }

}

export default function fromNestingSourceDr(nesting_source: {selector: string[], start_point: string}): Addr {
  const parts = nesting_source.selector
  const parsed_start_point = parseStartPoint(nesting_source.start_point)
  const target_nest_name = parts[parts.length - 1]

  if (!target_nest_name) {
    throw new Error('target_nest_name cant be empty')
  }

  return {
    result_type: 'nesting',
    zip_name: null,
    state: emptyObject,
    nesting: {
      path: nesting_source.selector,
      base: parts.slice(0, parts.length - 1),
      target_nest_name,
    },
    from_base: parsed_start_point.from_base,
    resource: parsed_start_point.resource,
    as_string: null,
  }
}
