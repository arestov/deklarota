
import structureChild from '../../structure/child'
import nestModelKey from './nestModelKey'
import spv from '../../../spv'
const build = function(self, nest_rqc) {
  self._chi_nest_rqc = {}
  self._nest_rqc = spv.cloneObj({}, nest_rqc)

  for (const name in nest_rqc) {
    if (!nest_rqc.hasOwnProperty(name)) {
      continue
    }

    const key = nestModelKey(name)
    const cur = nest_rqc[name]
    if (cur) {

      self._nest_rqc[name] = cur
      if (cur.type == 'constr') {
        self._chi_nest_rqc[cur.key] = structureChild(name, cur.value, ['nest', 'model'])
      } else {
        self._chi_nest_rqc[key] = null
      }

    } else {
      self._chi_nest_rqc[key] = null
      self._nest_rqc[name] = null
    }
  }
}

export default build
