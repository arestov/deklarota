
import getParsedPath from '../../routes/legacy/getParsedPath'

// var NestingSourceDr = require('../../utils/NestingSourceDr');

// var parts = string.split('>');
// console.log('NestingSourceDr()', parts)
// this.start_point = parts.length > 1 && parts[0];
// this.selector = splitByDot(parts[parts.length - 1]);
var toPath = function(string) {
  if (!string) {
    return {}
  }

  return {
    path: string,
    template: getParsedPath(string),
  }
}

var parseStartPoint = function(start_point) {
  if (!start_point) {
    return {
      resource: {},
      from_base: {},
    }
  }

  var parsed_path = getParsedPath(start_point)

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
    from_base: {},
  }

}

export default function fromNestingSourceDr(nesting_source) {
  var parts = nesting_source.selector
  var parsed_start_point = parseStartPoint(nesting_source.start_point)

  return {
    result_type: 'nesting',
    zip_name: null,
    state: {},
    nesting: {
      path: nesting_source.selector,
      base: parts.slice(0, parts.length - 1),
      target_nest_name: parts[parts.length - 1],
    },
    from_base: parsed_start_point.from_base,
    resource: parsed_start_point.resource,
    as_string: null,
  }
}
