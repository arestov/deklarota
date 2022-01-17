import { doCopy } from '../../spv/cloneObj'
import pushToRoute from '../structure/pushToRoute'

function makeItemByData(self, nesting_name, data) {
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
  })
  return self.initSi(best_constr, v2_data)
}

export default makeItemByData
