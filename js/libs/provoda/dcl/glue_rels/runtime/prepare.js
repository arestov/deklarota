import memorize from '../../../../spv/memorize'
import cloneObj from '../../../../spv/cloneObj'
import NestWatch from '../../../nest-watch/NestWatch'
import watch_handlers from './watch_handlers'
import isGlueRoot from './isGlueRoot'


const prepareGlueSourceRuntime = memorize(function prepareGlueSourceRuntime(data) {
  var addr = data.source
  var copy = cloneObj({}, addr)

  var state_name = addr.state && addr.state.path

  if (state_name) {
    throw new Error('state_name should be empty')
  }

  var zip_name = addr.zip_name || 'all'

  if (zip_name !== 'all') {
    throw new Error('zip_name should be "all"')
  }

  var nwatch = !isGlueRoot(addr) && new NestWatch(copy, null, {
    onchd_state: watch_handlers.hnest_state,
    onchd_count: watch_handlers.hnest,
  })

  copy.nwatch = nwatch

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
