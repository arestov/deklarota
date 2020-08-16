
var spv = require('spv')
var splitByDot = spv.splitByDot
var getParsedState = require('../../utils/getParsedState')


var getPath = spv.memorize(function(full_name) {
  var result = getParsedState(full_name)
  if (result) {
    return result
  }

  var base_state_name = splitByDot(full_name)[0]
  return {
    rel_type: 'local_state',
    full_name: full_name,
    state_name: base_state_name,
    full_state_name: full_name,
    base_state_name: base_state_name,
  }
})

var createStateInfo = function(full_state_name, base_state_name) {
  if (!full_state_name) {
    return {}
  }
  return {
    base: base_state_name || splitByDot(full_state_name)[0],
    path: full_state_name,
  }
}

var getFullPathInfo = spv.memorize(function(full_path) {
  var info = getPath(full_path)

  switch (info.rel_type) {
    case 'local_state': {
      return {
        result_type: 'state',
        state: createStateInfo(info, info.base_state_name),
        nesting: {
          path: null,
        },
        from_base: {
          type: null,
          steps: null,
        },
        raw_info: info,
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
      var parts = info.nesting_source.selector

      return {
        result_type: info.state_name ? 'state' : 'nesting',
        zip_name: info.zip_name || null,
        state: createStateInfo(info.state_name),
        nesting: {
          path: parts,
          base: parts.slice(0, parts.length - 1),
          target_nest_name: parts[parts.length - 1],
        },
        from_base: {
          type: null,
          steps: null,
        },
        raw_info: info,
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
        nesting: {},
        from_base: {
          type: 'parent',
          steps: info.ancestors,
        },
        raw_info: info,
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
        nesting: {},
        from_base: {
          type: 'root',
          steps: null,
        },
        raw_info: info,
        as_string: null,
      }
    }
  }


})

export default getFullPathInfo
