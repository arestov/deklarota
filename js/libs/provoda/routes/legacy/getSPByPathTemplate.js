
import getParsedPath from './getParsedPath'
import executeStringTemplate from './executeStringTemplate'

const getSPByPathTemplate = function(app, start_md, string_template, need_constr, md_for_urldata, options) {
  const parsed_template = getParsedPath(string_template)
  return executeStringTemplate(app, start_md, parsed_template, need_constr, md_for_urldata, options)
}

export default getSPByPathTemplate
