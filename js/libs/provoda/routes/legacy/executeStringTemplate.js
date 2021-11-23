
import pathExecutor from './stringify'
import followStringTemplate from './followStringTemplate'
const getPath = pathExecutor(function(chunkName, _app, md) {
  return md._provoda_id && md.state(chunkName)
})

const executeStringTemplate = function(app, md, obj, need_constr, md_for_urldata) {
  const full_path = getPath(obj, app, md_for_urldata || md)
  return followStringTemplate(app, md, obj, need_constr, full_path)
}

export default executeStringTemplate
