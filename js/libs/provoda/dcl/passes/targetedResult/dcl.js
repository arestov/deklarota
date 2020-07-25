define(function(require) {
'use strict'
var parseMultiPath = require('../../../utils/multiPath/parse')

var targetData = function(to, result_name, dsl_options) {
  if (!Array.isArray(to)) {
    throw new Error('to: should be array ' + to)
  }
  var target_path = to[0];
  var options = to[1];
  var parsed_path = parseMultiPath(target_path, true)
  var isAction = Boolean(options && options.action)

  if (parsed_path.result_type != 'nesting' && parsed_path.result_type != 'state' && !isAction) {
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

  return {
    path_type: target_path == '*' ? 'by_provoda_id' : 'by_path',
    value_by_name: result_name ? true : false,
    target_path: parsed_path,
    options: options,
    result_name: result_name,
  }
}

var targetsList = function(byName) {
  var result = [];
  for (var name in byName) {
    if (!byName.hasOwnProperty(name)) {
      continue;
    }
    result.push(targetData(byName[name], name))
  }
  return result;
}

function targetedResult(self, to) {
  self.by_named_result = !Array.isArray(to)

  self.targeted_results_list = null;
  self.targeted_single_result = null;

  if (self.by_named_result) {
    self.targeted_results_list = targetsList(to)
  } else {
    self.targeted_single_result = targetData(to)
  }
}

return targetedResult

})
