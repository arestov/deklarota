
import spv from 'spv'
var getTargetField = spv.getTargetField

import getParsedPath from './getParsedPath'
import pathExecutor from './stringify'
import followStringTemplate from './followStringTemplate'

var getPathBySimpleData = pathExecutor(function(chunkName, app, data) {
  return data && getTargetField(data, chunkName)
})

var getSPByPathTemplateAndData = function(app, start_md, string_template, need_constr, data, strict, options, extra_states) {
  var parsed_template = getParsedPath(string_template)
  var full_path = getPathBySimpleData(parsed_template, app, data)
  return followStringTemplate(app, start_md, parsed_template, need_constr, full_path, strict, options, extra_states)
}

export default getSPByPathTemplateAndData
