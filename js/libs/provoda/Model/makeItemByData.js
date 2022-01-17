import { doCopy } from '../../spv/cloneObj'
import pushToRoute from '../structure/pushToRoute'

function makeItemByData(self, nesting_name, data, item_params) {
  const mentioned = self._nest_rqc[nesting_name]
  const md = self
  if (!mentioned) {
    throw new Error('cant make item')
  }

  const created = pushToRoute(md, nesting_name, data)
  if (created) {
    return created
  }

  const best_constr = self._all_chi[mentioned.key]

  const v2_data = doCopy({
    by: 'LoadableList',
    init_version: 2,
    attrs: data,
  }, convertToNestings(item_params))
  return self.initSi(best_constr, v2_data)
}


function convertToNestings(params) {
  if (params == null) {return}

  if (params.subitems) {
    throw new Error('`subitems` prop of initingParams is depricated. use `rels`')
  }

  if (params.subitems_source_name) {
    throw new Error('`subitems_source_name` prop of initingParams is depricated. use `nestings_sources`')
  }

  return {
    rels: params.rels,
    nestings_sources: params.nestings_sources,
  }
}


export default makeItemByData
