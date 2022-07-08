
import parseMultiPath from '../../../utils/multiPath/parse'

const targetData = function(to, result_name, dsl_options) {
  if (!Array.isArray(to)) {
    throw new Error('to: should be array ' + to)
  }
  const target_path = to[0]
  const options = to[1]
  const parsed_path = parseMultiPath(target_path, true)
  const isAction = Boolean(options && options.action)

  if (parsed_path.resource?.path && options.autocreate_routed_target == null) {
    console.log('define autocreate_routed_target=true|false', to)
    throw new Error('define autocreate_routed_target=true|false')

  }

  if (parsed_path.result_type != 'nesting' && parsed_path.result_type != 'state' && !isAction) {
    console.log(to)
    throw new Error('we can put result to nesting or state only')
  }

  if (parsed_path.result_type == 'state') {
    if (isAction) {
      throw new Error('attr cant be target for action')
    }

    // * is special case. check __tests__/pass/1.1.js
    if (parsed_path.state.base != '*' && parsed_path.state.path != parsed_path.state.base) {
      throw new Error('paths in state is not supported yet')
    }
  }

  if (parsed_path.result_type === 'nesting' && (!options || !(options.method || isAction))) {
    throw new Error('use options.method to describe how to save relation')
  }

  if (dsl_options && dsl_options.warn) {
    if (parsed_path.result_type == 'nesting' && (!options || !options.schema)) {
      console.warn('implement schema parsing. add schema to pass dcl')
    }
  }

  switch (options?.base) {
    case undefined:
    case 'arg_nesting_next':
    case 'arg_nesting_prev': {
      break
    }
    default: {
      throw new Error('unknow base ' + options.base)
    }
  }

  // how validate options.map_values_list_to_target ?

  return {
    path_type: target_path == '*' ? 'by_provoda_id' : 'by_path',
    value_by_name: result_name ? true : false,
    target_path: parsed_path,
    options: options,
    result_name: result_name,
  }
}

const targetsList = function(byName) {
  const result = []
  for (const name in byName) {
    if (!byName.hasOwnProperty(name)) {
      continue
    }
    result.push(targetData(byName[name], name))
  }
  return result
}

function targetedResult(self, to) {
  self.by_named_result = !Array.isArray(to)

  self.targeted_results_list = null
  self.targeted_single_result = null

  if (self.by_named_result) {
    self.targeted_results_list = targetsList(to)
  } else {
    self.targeted_single_result = targetData(to)
  }
}

export default targetedResult
