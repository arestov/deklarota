
import spv from '../../../spv'

import getParsedPath from './getParsedPath'
import pathExecutor from './stringify'
import followStringTemplate from './followStringTemplate'
const getTargetField = spv.getTargetField

const getPathBySimpleData = pathExecutor(function(chunkName, _app, data) {
  return data && getTargetField(data, chunkName)
})

const getSPByPathTemplateAndData = function(app, start_md, string_template, need_constr, data, strict, options, extra_states) {
  const parsed_template = getParsedPath(string_template)
  const full_path = getPathBySimpleData(parsed_template, app, data)
  return followStringTemplate(app, start_md, parsed_template, need_constr, full_path, strict, options, extra_states)
}

export default getSPByPathTemplateAndData
