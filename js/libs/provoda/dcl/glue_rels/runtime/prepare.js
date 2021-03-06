import memorize from '../../../../spv/memorize'
import isGlueRoot from './isGlueRoot'
import isGlueParent from './isGlueParent'


const prepareGlueSourceRuntime = memorize(function prepareGlueSourceRuntime(data) {
  var addr = data.source

  var state_name = addr.state && addr.state.path

  if (state_name) {
    throw new Error('state_name should be empty')
  }

  var zip_name = addr.zip_name || 'all'

  if (zip_name !== 'all') {
    throw new Error('zip_name should be "all"')
  }

  var nwatch = (!isGlueRoot(addr) && !isGlueParent(addr))

  if (nwatch) {
    throw new Error('get rid of nwatch using rel-glue')
  }

  return {
    addr: addr,
    meta_relation: data.meta_relation,
    nwatch: nwatch,
    final_rel_addr: data.final_rel_addr,
    final_rel_key: data.final_rel_key,
  }

}, function(data) {
  return data.meta_relation
})

export default prepareGlueSourceRuntime
