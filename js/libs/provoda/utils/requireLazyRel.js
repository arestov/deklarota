import getRelShape from '../dcl/nests/getRelShape'
import updateNesting from '../Model/updateNesting'
import getNesting from '../provoda/getNesting'
import { getNestingConstr } from '../structure/get_constr'

const requireLazyRel = (self, rel_name) => {
  const value = getNesting(self, rel_name)
  if (value != null) {
    return value
  }

  const Constr = getNestingConstr(self.app, self, rel_name)
  const item = self.initSi(Constr, {
    by: 'requireLazyRel',
    init_version: 2,
    attrs: null,
  })

  const { many } = getRelShape(self, rel_name)
  updateNesting(self, rel_name, many ? [item] : item)
  return item
}

export default requireLazyRel
